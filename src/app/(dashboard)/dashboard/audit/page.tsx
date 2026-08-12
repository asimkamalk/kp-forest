import { Suspense } from "react";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  AuditLogClient,
  type AuditRow,
} from "@/components/dashboard/audit/audit-log-client";

const PAGE_SIZE = 50;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(sp: Record<string, string | string[] | undefined>, key: string) {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function AuditDashboardPage({ searchParams }: Props) {
  await requireRole(Role.SUPER_ADMIN);
  const sp = await searchParams;

  const action = param(sp, "action") || "all";
  const entity = param(sp, "entity") || "all";
  const userId = param(sp, "userId") || "all";
  const from = param(sp, "from");
  const to = param(sp, "to");
  const page = Math.max(1, Number.parseInt(param(sp, "page") || "1", 10) || 1);

  const where: Prisma.AuditLogWhereInput = {};
  if (action !== "all") where.action = action;
  if (entity !== "all") where.entity = entity;
  if (userId !== "all") where.userId = userId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const [total, rows, actions, entities, users] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
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

  const mapped: AuditRow[] = rows.map((r) => ({
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
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <p className="eyebrow text-resin">Audit</p>
        <h1 className="mt-1 font-display text-2xl text-bark">Audit log</h1>
        <p className="mt-2 text-sm text-moss">
          Read-only record of dashboard actions. Entries cannot be edited or deleted.
        </p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-[12px] bg-mist" />}>
        <AuditLogClient
          rows={mapped}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          actions={actions.map((a) => a.action)}
          entities={entities.map((e) => e.entity)}
          users={users}
          filters={{ action, entity, userId, from, to }}
        />
      </Suspense>
    </div>
  );
}
