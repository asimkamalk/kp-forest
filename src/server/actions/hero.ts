"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { heroSlideSchema, reorderSchema } from "@/lib/validators/hero";
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
      entity: "HeroSlide",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function createHeroSlide(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.heroSlide.create({ data: parsed.data });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("hero", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create slide";
    return actionError(message);
  }
}

export async function updateHeroSlide(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = heroSlideSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.heroSlide.findUnique({ where: { id } });
  if (!before) return actionError("Slide not found");

  try {
    const row = await prisma.heroSlide.update({ where: { id }, data: parsed.data });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("hero", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update slide";
    return actionError(message);
  }
}

export async function deleteHeroSlide(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.heroSlide.findUnique({ where: { id } });
  if (!before) return actionError("Slide not found");

  try {
    await prisma.heroSlide.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("hero", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete slide";
    return actionError(message);
  }
}

export async function duplicateHeroSlide(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const source = await prisma.heroSlide.findUnique({ where: { id } });
  if (!source) return actionError("Slide not found");

  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = source;
    const row = await prisma.heroSlide.create({
      data: {
        ...rest,
        title: `${source.title} (copy)`,
        status: "DRAFT",
        orderIndex: source.orderIndex + 1,
      },
    });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("hero", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not duplicate slide";
    return actionError(message);
  }
}

export async function reorderHeroSlides(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = reorderSchema.safeParse(input);
  if (!parsed.success) return actionError("Invalid order payload");

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, orderIndex) =>
        prisma.heroSlide.update({ where: { id }, data: { orderIndex } })
      )
    );
    await writeAudit(session.user.id, "UPDATE", "reorder", null, {
      orderedIds: parsed.data.orderedIds,
    });
    revalidateTag("hero", "max");
    return actionOk({ count: parsed.data.orderedIds.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reorder slides";
    return actionError(message);
  }
}

export async function publishHeroSlide(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.heroSlide.findUnique({ where: { id } });
  if (!before) return actionError("Slide not found");

  try {
    const row = await prisma.heroSlide.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", id, before, row);
    revalidateTag("hero", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not publish slide";
    return actionError(message);
  }
}
