"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { navItemSchema, reorderNavItemsSchema } from "@/lib/validators/nav-item";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

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

function toData(parsed: ReturnType<typeof navItemSchema.parse>) {
  return {
    label: parsed.label,
    labelUr: parsed.labelUr ?? null,
    href: parsed.href ?? null,
    icon: parsed.icon ?? null,
    target: parsed.target,
    orderIndex: parsed.orderIndex,
    isVisible: parsed.isVisible,
    isMegaMenu: parsed.isMegaMenu,
    isDynamicRegions: parsed.isDynamicRegions,
    parentId: parsed.parentId ?? null,
  };
}

export async function createNavItem(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = navItemSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.navItem.create({ data: toData(parsed.data) });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("nav", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create nav item";
    return actionError(message);
  }
}

export async function updateNavItem(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = navItemSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.navItem.findUnique({ where: { id } });
  if (!before) return actionError("Nav item not found");

  try {
    const row = await prisma.navItem.update({ where: { id }, data: toData(parsed.data) });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("nav", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update nav item";
    return actionError(message);
  }
}

export async function deleteNavItem(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const before = await prisma.navItem.findUnique({
    where: { id },
    include: { _count: { select: { children: true } } },
  });
  if (!before) return actionError("Nav item not found");

  if (before._count.children > 0) {
    return actionError(
      `Cannot delete “${before.label}” — it still has ${before._count.children} child item${before._count.children === 1 ? "" : "s"}. Remove or move the children first.`
    );
  }

  try {
    await prisma.navItem.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("nav", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete nav item";
    return actionError(message);
  }
}

export async function reorderNavItems(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = reorderNavItemsSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid order payload");

  const parentId = parsed.data.parentId === undefined ? null : parsed.data.parentId;

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, orderIndex) =>
        prisma.navItem.update({
          where: { id },
          data: { orderIndex, parentId },
        })
      )
    );
    await writeAudit(session.user.id, "UPDATE", "reorder", null, {
      orderedIds: parsed.data.orderedIds,
      parentId,
    });
    revalidateTag("nav", "max");
    return actionOk({ count: parsed.data.orderedIds.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reorder nav items";
    return actionError(message);
  }
}
