"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { navItemSchema, reorderNavSchema } from "@/lib/validators/nav";
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
      entity: "NavItem",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function createNavItem(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = navItemSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.navItem.create({
      data: {
        ...parsed.data,
        href: parsed.data.href || null,
        parentId: parsed.data.parentId || null,
      },
    });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("nav", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not create nav item");
  }
}

export async function updateNavItem(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = navItemSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.navItem.findUnique({ where: { id } });
  if (!before) return actionError("Nav item not found");

  try {
    const row = await prisma.navItem.update({
      where: { id },
      data: {
        ...parsed.data,
        href: parsed.data.href || null,
        parentId: parsed.data.parentId || null,
      },
    });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("nav", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update nav item");
  }
}

export async function deleteNavItem(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.navItem.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });
  if (!before) return actionError("Nav item not found");

  try {
    await prisma.navItem.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("nav", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete nav item");
  }
}

export async function reorderNavItems(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = reorderNavSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid order payload");

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, orderIndex) =>
        prisma.navItem.update({
          where: { id },
          data: {
            orderIndex,
            parentId: parsed.data.parentId === undefined ? undefined : parsed.data.parentId,
          },
        })
      )
    );
    await writeAudit(session.user.id, "UPDATE", "reorder", null, parsed.data);
    revalidateTag("nav", "max");
    return actionOk({ count: parsed.data.orderedIds.length });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not reorder nav");
  }
}
