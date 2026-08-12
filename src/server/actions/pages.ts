"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitiseHtml, sanitiseText } from "@/lib/sanitise";
import { pageSchema } from "@/lib/validators/admin";
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
      entity: "Page",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

function toPageData(data: ReturnType<typeof pageSchema.parse>) {
  return {
    slug: data.slug,
    title: sanitiseText(data.title, 200),
    titleUr: data.titleUr ? sanitiseText(data.titleUr, 200) : null,
    summary: data.summary ? sanitiseText(data.summary, 600) : null,
    body: sanitiseHtml(data.body),
    bodyUr: data.bodyUr ? sanitiseHtml(data.bodyUr) : null,
    coverImage: data.coverImage ?? null,
    seoTitle: data.seoTitle ? sanitiseText(data.seoTitle, 120) : null,
    seoDescription: data.seoDescription
      ? sanitiseText(data.seoDescription, 300)
      : null,
    orderIndex: data.orderIndex,
    status: data.status,
  };
}

export async function createPage(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const taken = await prisma.page.findUnique({ where: { slug: parsed.data.slug } });
  if (taken) return actionError("A page with this slug already exists");

  try {
    const row = await prisma.page.create({ data: toPageData(parsed.data) });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("pages", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not create page");
  }
}

export async function updatePage(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const before = await prisma.page.findUnique({ where: { id } });
  if (!before) return actionError("Page not found");

  const clash = await prisma.page.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });
  if (clash) return actionError("A page with this slug already exists");

  try {
    const row = await prisma.page.update({
      where: { id },
      data: toPageData(parsed.data),
    });
    await writeAudit(session.user.id, "UPDATE", id, before, row);
    revalidateTag("pages", "max");
    revalidateTag(`page:${row.slug}`, "max");
    if (before.slug !== row.slug) {
      revalidateTag(`page:${before.slug}`, "max");
    }
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update page");
  }
}

export async function deletePage(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.page.findUnique({ where: { id } });
  if (!before) return actionError("Page not found");

  try {
    await prisma.page.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("pages", "max");
    revalidateTag(`page:${before.slug}`, "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete page");
  }
}

export async function publishPage(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.page.findUnique({ where: { id } });
  if (!before) return actionError("Page not found");

  try {
    const row = await prisma.page.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", id, before, row);
    revalidateTag("pages", "max");
    revalidateTag(`page:${row.slug}`, "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not publish page");
  }
}
