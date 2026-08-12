"use server";

import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { RequestKind, RequestStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitiseMultiline, sanitiseText } from "@/lib/sanitise";
import {
  citizenRequestSchema,
  trackTicketSchema,
  updateRequestStatusSchema,
} from "@/lib/validators/contact";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

const ORG_ROLES = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
] as const;

const MIN_SUBMIT_MS = 3000;
const SUBMIT_LIMIT = 3;
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
const TRACK_LIMIT = 10;
const TRACK_WINDOW_MS = 60 * 60 * 1000;

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

async function generateTicketNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `KPFD-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const latest = await prisma.publicRequest.findFirst({
      where: { ticketNo: { startsWith: prefix } },
      orderBy: { ticketNo: "desc" },
      select: { ticketNo: true },
    });
    let next = 1;
    if (latest) {
      const n = Number.parseInt(latest.ticketNo.slice(prefix.length), 10);
      if (!Number.isNaN(n)) next = n + 1;
    }
    const ticketNo = `${prefix}${String(next).padStart(5, "0")}`;
    const clash = await prisma.publicRequest.findUnique({
      where: { ticketNo },
      select: { id: true },
    });
    if (!clash) return ticketNo;
  }
  throw new Error("Could not allocate a ticket number");
}

/**
 * Public: lodge a complaint or suggestion (kind GENERAL).
 * Subject is stored in `topic` — schema has no dedicated subject column.
 */
export async function submitCitizenRequest(
  input: unknown
): Promise<ActionResult<{ ticketNo: string }>> {
  const ip = await clientIp();
  const limited = rateLimit(`citizen-submit:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS);
  if (!limited.ok) {
    return actionError(
      `You can submit at most ${SUBMIT_LIMIT} requests per hour. Try again in ${limited.retryAfterSec} seconds.`
    );
  }

  const parsed = citizenRequestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;

  if (data.website && data.website.length > 0) {
    return actionError("Rejected");
  }

  const elapsed = Date.now() - data.formStartedAt;
  if (elapsed < MIN_SUBMIT_MS || elapsed > 24 * 60 * 60 * 1000) {
    return actionError("Please take a moment to complete the form, then submit again.");
  }

  try {
    const ticketNo = await generateTicketNo();
    const row = await prisma.publicRequest.create({
      data: {
        ticketNo,
        kind: RequestKind.GENERAL,
        fullName: sanitiseText(data.fullName, 120),
        cnic: data.cnic,
        phone: data.phone,
        email: data.email ? sanitiseText(data.email, 160) : null,
        district: data.district,
        address: data.address ? sanitiseText(data.address, 400) : null,
        purpose: sanitiseMultiline(data.purpose, 2000),
        attachmentUrl: data.attachmentUrl || null,
        topic: data.subject,
        requestStatus: RequestStatus.NEW,
      },
    });

    return actionOk({ ticketNo: row.ticketNo });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not submit the request";
    return actionError(message);
  }
}

/** Public: status + public officer note only. Never returns personal fields. */
export async function trackCitizenRequest(
  input: unknown
): Promise<
  ActionResult<{
    ticketNo: string;
    requestStatus: RequestStatus;
    officerNote: string | null;
  }>
> {
  const ip = await clientIp();
  const limited = rateLimit(`citizen-track:${ip}`, TRACK_LIMIT, TRACK_WINDOW_MS);
  if (!limited.ok) {
    return actionError(
      `Too many lookups from this connection. Try again in ${limited.retryAfterSec} seconds.`
    );
  }

  const parsed = trackTicketSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid ticket number");
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return actionError("Rejected");
  }

  const row = await prisma.publicRequest.findUnique({
    where: { ticketNo: parsed.data.ticketNo },
    select: {
      ticketNo: true,
      requestStatus: true,
      officerNote: true,
    },
  });

  if (!row) {
    return actionError("No request found for that ticket number");
  }

  return actionOk({
    ticketNo: row.ticketNo,
    requestStatus: row.requestStatus,
    officerNote: row.officerNote,
  });
}

async function writeAudit(
  userId: string,
  action: string,
  entityId: string,
  before: unknown,
  after: unknown
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity: "PublicRequest",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function updatePublicRequest(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  const parsed = updateRequestStatusSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const before = await prisma.publicRequest.findUnique({ where: { id } });
  if (!before) return actionError("Request not found");

  try {
    const row = await prisma.publicRequest.update({
      where: { id },
      data: {
        requestStatus: parsed.data.requestStatus,
        officerNote:
          parsed.data.officerNote == null
            ? null
            : sanitiseMultiline(String(parsed.data.officerNote), 4000),
        handledBy: session.user.id,
      },
    });
    await writeAudit(session.user.id, "UPDATE", id, before, row);
    revalidateTag("requests", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update request";
    return actionError(message);
  }
}

export type RequestExportFilter = {
  kind?: string;
  district?: string;
  from?: string;
  to?: string;
};

export async function exportPublicRequestsCsv(
  filter: RequestExportFilter
): Promise<ActionResult<{ csv: string; count: number }>> {
  const session = await requireRole(...ORG_ROLES);

  const where: {
    kind?: RequestKind;
    district?: string;
    createdAt?: { gte?: Date; lte?: Date };
  } = {};

  if (filter.kind && filter.kind !== "all") {
    where.kind = filter.kind as RequestKind;
  }
  if (filter.district && filter.district !== "all") {
    where.district = filter.district;
  }
  if (filter.from || filter.to) {
    where.createdAt = {};
    if (filter.from) where.createdAt.gte = new Date(filter.from);
    if (filter.to) {
      const end = new Date(filter.to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  try {
    const rows = await prisma.publicRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const header = [
      "ticketNo",
      "kind",
      "subject",
      "fullName",
      "cnic",
      "phone",
      "email",
      "district",
      "address",
      "purpose",
      "requestStatus",
      "officerNote",
      "handledBy",
      "createdAt",
    ];

    const escape = (v: string | number | null | undefined) => {
      const s = v == null ? "" : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.ticketNo,
          r.kind,
          r.topic ?? "",
          r.fullName,
          r.cnic,
          r.phone,
          r.email,
          r.district,
          r.address,
          r.purpose,
          r.requestStatus,
          r.officerNote,
          r.handledBy,
          r.createdAt.toISOString(),
        ]
          .map(escape)
          .join(",")
      ),
    ];

    await writeAudit(session.user.id, "EXPORT", "bulk", null, {
      filter,
      count: rows.length,
      exportedAt: new Date().toISOString(),
    });

    revalidateTag("requests", "max");
    return actionOk({ csv: lines.join("\n"), count: rows.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not export requests";
    return actionError(message);
  }
}
