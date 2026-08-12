"use server";

import { revalidateTag } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "@/lib/validators/admin";
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
      entity: "User",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

/** Never return passwordHash to callers. */
function publicUser<T extends { passwordHash?: string }>(row: T) {
  const { passwordHash: _omit, ...rest } = row;
  return rest;
}

function scopeForRole(role: Role, data: {
  regionId?: string | null;
  circleId?: string | null;
  divisionId?: string | null;
}) {
  if (role === Role.SUPER_ADMIN || role === Role.EDITOR || role === Role.VIEWER) {
    return { regionId: null, circleId: null, divisionId: null };
  }
  if (role === Role.REGION_ADMIN) {
    return { regionId: data.regionId ?? null, circleId: null, divisionId: null };
  }
  if (role === Role.CIRCLE_ADMIN) {
    return { regionId: null, circleId: data.circleId ?? null, divisionId: null };
  }
  return { regionId: null, circleId: null, divisionId: data.divisionId ?? null };
}

export async function createUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return actionError("A user with this email already exists");

  try {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const scope = scopeForRole(data.role, data);
    const row = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: data.role,
        designation: data.designation ?? null,
        phone: data.phone ?? null,
        avatarUrl: data.avatarUrl ?? null,
        isActive: data.isActive,
        ...scope,
      },
    });
    await writeAudit(session.user.id, "CREATE", row.id, null, publicUser(row));
    revalidateTag("users", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not create user");
  }
}

export async function updateUser(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const before = await prisma.user.findUnique({ where: { id } });
  if (!before) return actionError("User not found");

  if (id === session.user.id) {
    if (parsed.data.role !== before.role) {
      return actionError("You cannot change your own role");
    }
    if (parsed.data.isActive === false && before.isActive) {
      return actionError("You cannot deactivate your own account");
    }
  }

  const email = parsed.data.email.toLowerCase().trim();
  const clash = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (clash) return actionError("A user with this email already exists");

  try {
    const scope = scopeForRole(parsed.data.role, parsed.data);
    const row = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name.trim(),
        email,
        role: parsed.data.role,
        designation: parsed.data.designation ?? null,
        phone: parsed.data.phone ?? null,
        avatarUrl: parsed.data.avatarUrl ?? null,
        isActive: parsed.data.isActive,
        ...scope,
      },
    });
    await writeAudit(
      session.user.id,
      "UPDATE",
      id,
      publicUser(before),
      publicUser(row)
    );
    revalidateTag("users", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update user");
  }
}

export async function resetUserPassword(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const before = await prisma.user.findUnique({ where: { id } });
  if (!before) return actionError("User not found");

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    await writeAudit(session.user.id, "RESET_PASSWORD", id, { id }, { id });
    revalidateTag("users", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not reset password");
  }
}

export async function deleteUser(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(Role.SUPER_ADMIN);
  if (id === session.user.id) {
    return actionError("You cannot delete your own account");
  }

  const before = await prisma.user.findUnique({ where: { id } });
  if (!before) return actionError("User not found");

  try {
    // AuditLog.userId uses onDelete: SetNull — trail survives the account.
    await prisma.user.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, publicUser(before), null);
    revalidateTag("users", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete user");
  }
}
