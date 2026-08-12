"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { clientIp } from "@/lib/citizen-form-guard";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { downloadSchema } from "@/lib/validators/download";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

const CONTENT_ROLES = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
  Role.EDITOR,
] as const;

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
      entity: "Download",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function createDownload(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = downloadSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.download.create({ data: parsed.data });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("downloads", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create download";
    return actionError(message);
  }
}

export async function updateDownload(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = downloadSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.download.findUnique({ where: { id } });
  if (!before) return actionError("Download not found");

  try {
    const row = await prisma.download.update({ where: { id }, data: parsed.data });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("downloads", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update download";
    return actionError(message);
  }
}

export async function deleteDownload(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.download.findUnique({ where: { id } });
  if (!before) return actionError("Download not found");

  try {
    await prisma.download.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("downloads", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete download";
    return actionError(message);
  }
}

export async function publishDownload(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.download.findUnique({ where: { id } });
  if (!before) return actionError("Download not found");

  try {
    const row = await prisma.download.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", id, before, row);
    revalidateTag("downloads", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not publish download";
    return actionError(message);
  }
}

/** Public: bump counter without blocking the browser download. */
export async function incrementDownloadCount(
  id: string
): Promise<ActionResult<{ id: string }>> {
  if (!id) return actionError("Missing download id");

  const ip = await clientIp();
  const limited = rateLimit(`download-count:${ip}`, 60, 60 * 60 * 1000);
  if (!limited.ok) {
    return actionError(
      `Too many requests. Try again in ${limited.retryAfterSec} seconds.`
    );
  }

  try {
    const row = await prisma.download.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    return actionOk({ id: row.id });
  } catch {
    return actionError("Could not record download");
  }
}
