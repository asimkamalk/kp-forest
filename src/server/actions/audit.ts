"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditFilterSchema } from "@/lib/validators/admin";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

const PAGE_SIZE = 50;

async function clientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || null;
}

function buildWhere(filter: {
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
}): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  if (filter.action && filter.action !== "all") where.action = filter.action;
  if (filter.entity && filter.entity !== "all") where.entity = filter.entity;
  if (filter.userId && filter.userId !== "all") where.userId = filter.userId;
  if (filter.from || filter.to) {
    where.createdAt = {};
    if (filter.from) where.createdAt.gte = new Date(filter.from);
    if (filter.to) {
      const end = new Date(filter.to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }
  return where;
}

export type AuditLogRow = {
  id: string;
  createdAt: string;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  userName: string | null;
  userEmail: string | null;
  before: unknown;
  after: unknown;
};

export async function listAuditLogs(
  input: unknown
): Promise<
  ActionResult<{
    rows: AuditLogRow[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  await requireRole(Role.SUPER_ADMIN);
  const parsed = auditFilterSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid filter");
  }

  const filter = parsed.data;
  const where = buildWhere(filter);
  const page = filter.page;

  try {
    const [total, rows] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    return actionOk({
      rows: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        action: r.action,
        entity: r.entity,
        entityId: r.entityId,
        ip: r.ip,
        userName: r.user?.name ?? null,
        userEmail: r.user?.email ?? null,
        before: r.before,
        after: r.after,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not load audit log");
  }
}

export async function exportAuditLogsCsv(
  input: unknown
): Promise<ActionResult<{ csv: string; count: number }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = auditFilterSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid filter");
  }

  const where = buildWhere(parsed.data);

  try {
    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10_000,
      include: { user: { select: { name: true, email: true } } },
    });

    const header = [
      "createdAt",
      "userName",
      "userEmail",
      "action",
      "entity",
      "entityId",
      "ip",
      "before",
      "after",
    ];

    const escape = (v: string | null | undefined) => {
      const s = v == null ? "" : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.createdAt.toISOString(),
          r.user?.name ?? "",
          r.user?.email ?? "",
          r.action,
          r.entity,
          r.entityId ?? "",
          r.ip ?? "",
          r.before == null ? "" : JSON.stringify(r.before),
          r.after == null ? "" : JSON.stringify(r.after),
        ]
          .map(escape)
          .join(",")
      ),
    ];

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "EXPORT",
        entity: "AuditLog",
        entityId: "bulk",
        ip: await clientIp(),
        after: {
          filter: parsed.data,
          count: rows.length,
          exportedAt: new Date().toISOString(),
        },
      },
    });

    revalidateTag("audit", "max");
    return actionOk({ csv: lines.join("\n"), count: rows.length });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not export audit log");
  }
}

export async function getAuditFilterOptions(): Promise<
  ActionResult<{
    actions: string[];
    entities: string[];
    users: { id: string; name: string; email: string }[];
  }>
> {
  await requireRole(Role.SUPER_ADMIN);
  try {
    const [actions, entities, users] = await Promise.all([
      prisma.auditLog.findMany({
        distinct: ["action"],
        select: { action: true },
        orderBy: { action: "asc" },
      }),
      prisma.auditLog.findMany({
        distinct: ["entity"],
        select: { entity: true },
        orderBy: { entity: "asc" },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return actionOk({
      actions: actions.map((a) => a.action),
      entities: entities.map((e) => e.entity),
      users,
    });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not load filters");
  }
}
