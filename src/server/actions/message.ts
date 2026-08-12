"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema, reorderSchema } from "@/lib/validators/message";
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
      entity: "Message",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function createMessage(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.message.create({ data: parsed.data });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("messages", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create message";
    return actionError(message);
  }
}

export async function updateMessage(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.message.findUnique({ where: { id } });
  if (!before) return actionError("Message not found");

  try {
    const row = await prisma.message.update({ where: { id }, data: parsed.data });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("messages", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update message";
    return actionError(message);
  }
}

export async function deleteMessage(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.message.findUnique({ where: { id } });
  if (!before) return actionError("Message not found");

  try {
    await prisma.message.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("messages", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete message";
    return actionError(message);
  }
}

export async function reorderMessages(input: unknown): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid order payload");

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, orderIndex) =>
        prisma.message.update({ where: { id }, data: { orderIndex } })
      )
    );
    await writeAudit(session.user.id, "UPDATE", "reorder", null, {
      orderedIds: parsed.data.orderedIds,
    });
    revalidateTag("messages", "max");
    return actionOk({ count: parsed.data.orderedIds.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reorder messages";
    return actionError(message);
  }
}

export async function publishMessage(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.message.findUnique({ where: { id } });
  if (!before) return actionError("Message not found");

  try {
    const row = await prisma.message.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", id, before, row);
    revalidateTag("messages", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not publish message";
    return actionError(message);
  }
}
