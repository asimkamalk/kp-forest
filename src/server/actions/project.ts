"use server";

import { revalidateTag } from "next/cache";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { projectWhere } from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators/project";
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
      entity: "Project",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

export async function createProject(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    const row = await prisma.project.create({ data: parsed.data });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("projects", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create project";
    return actionError(message);
  }
}

export async function updateProject(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");

  const before = await prisma.project.findFirst({
    where: { id, ...projectWhere(session) },
  });
  if (!before) return actionError("Project not found");

  try {
    const row = await prisma.project.update({ where: { id }, data: parsed.data });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("projects", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not update project";
    return actionError(message);
  }
}

export async function deleteProject(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.project.findFirst({
    where: { id, ...projectWhere(session) },
  });
  if (!before) return actionError("Project not found");

  try {
    await prisma.project.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("projects", "max");
    return actionOk({ id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete project";
    return actionError(message);
  }
}

export async function publishProject(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...CONTENT_ROLES);
  const before = await prisma.project.findFirst({
    where: { id, ...projectWhere(session) },
  });
  if (!before) return actionError("Project not found");

  try {
    const row = await prisma.project.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await writeAudit(session.user.id, "PUBLISH", id, before, row);
    revalidateTag("projects", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not publish project";
    return actionError(message);
  }
}
