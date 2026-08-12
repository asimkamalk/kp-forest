"use server";

import { revalidateTag } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleScopeWhere, divisionScopeWhere } from "@/lib/org-scope";
import { divisionSchema, parseMapGeoJson } from "@/lib/validators/org";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

const ORG_ROLES = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
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
      entity: "Division",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

function toDivisionData(
  input: ReturnType<typeof divisionSchema.parse>,
  mapGeoJson: object | null
) {
  const { mapGeoJson: _ignored, ...rest } = input;
  return {
    ...rest,
    mapGeoJson:
      mapGeoJson === null
        ? Prisma.JsonNull
        : (mapGeoJson as Prisma.InputJsonValue),
  };
}

export async function createDivision(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  const parsed = divisionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const circle = await prisma.circle.findFirst({
    where: { id: parsed.data.circleId, ...circleScopeWhere(session.user) },
  });
  if (!circle) return actionError("Circle not found or out of scope");

  if (session.user.role === Role.DIVISION_ADMIN) {
    return actionError("Insufficient permission to create divisions");
  }

  try {
    const row = await prisma.division.create({
      data: toDivisionData(parsed.data, geo.data),
    });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("regions", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not create division");
  }
}

export async function updateDivision(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  const parsed = divisionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const before = await prisma.division.findFirst({
    where: { id, ...divisionScopeWhere(session.user) },
  });
  if (!before) return actionError("Division not found");

  try {
    const row = await prisma.division.update({
      where: { id },
      data: toDivisionData(parsed.data, geo.data),
    });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("regions", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update division");
  }
}

export async function deleteDivision(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (session.user.role === Role.DIVISION_ADMIN) {
    return actionError("Insufficient permission to delete divisions");
  }

  const before = await prisma.division.findFirst({
    where: { id, ...divisionScopeWhere(session.user) },
  });
  if (!before) return actionError("Division not found");

  try {
    await prisma.division.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("regions", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete division");
  }
}
