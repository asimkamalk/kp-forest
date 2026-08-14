"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reorderStatsSchema, statCounterSchema } from "@/lib/validators/stat";
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
      entity: "StatCounter",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function createStatCounter(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = statCounterSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.statCounter.create({ data: parsed.data });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("stats", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create statistic";
    return actionError(message);
  }
}

export async function updateStatCounter(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = statCounterSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.statCounter.findUnique({ where: { id } });
  if (!before) return actionError("Statistic not found");

  try {
    const row = await prisma.statCounter.update({ where: { id }, data: parsed.data });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("stats", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update statistic";
    return actionError(message);
  }
}

export async function deleteStatCounter(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.statCounter.findUnique({ where: { id } });
  if (!before) return actionError("Statistic not found");

  try {
    await prisma.statCounter.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("stats", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete statistic";
    return actionError(message);
  }
}

export async function reorderStatCounters(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = reorderStatsSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid order payload");

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, orderIndex) =>
        prisma.statCounter.update({ where: { id }, data: { orderIndex } })
      )
    );
    await writeAudit(session.user.id, "UPDATE", "reorder", null, {
      orderedIds: parsed.data.orderedIds,
    });
    revalidateTag("stats", "max");
    return actionOk({ count: parsed.data.orderedIds.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reorder statistics";
    return actionError(message);
  }
}

export async function publishStatCounter(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.statCounter.findUnique({ where: { id } });
  if (!before) return actionError("Statistic not found");

  try {
    const row = await prisma.statCounter.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", id, before, row);
    revalidateTag("stats", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not publish statistic";
    return actionError(message);
  }
}
