"use server";

import { revalidateTag } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleScopeWhere, regionScopeWhere } from "@/lib/org-scope";
import { circleSchema, parseMapGeoJson } from "@/lib/validators/org";
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
      entity: "Circle",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

function toCircleData(input: ReturnType<typeof circleSchema.parse>, mapGeoJson: object | null) {
  const { mapGeoJson: _ignored, ...rest } = input;
  return {
    ...rest,
    mapGeoJson:
      mapGeoJson === null
        ? Prisma.JsonNull
        : (mapGeoJson as Prisma.InputJsonValue),
  };
}

export async function createCircle(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  const parsed = circleSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const region = await prisma.region.findFirst({
    where: { id: parsed.data.regionId, ...regionScopeWhere(session.user) },
  });
  if (!region) return actionError("Region not found or out of scope");

  if (
    session.user.role === Role.CIRCLE_ADMIN ||
    session.user.role === Role.DIVISION_ADMIN
  ) {
    return actionError("Insufficient permission to create circles");
  }

  try {
    const row = await prisma.circle.create({
      data: toCircleData(parsed.data, geo.data),
    });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("regions", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not create circle");
  }
}

export async function updateCircle(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  const parsed = circleSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const before = await prisma.circle.findFirst({
    where: { id, ...circleScopeWhere(session.user) },
  });
  if (!before) return actionError("Circle not found");

  try {
    const row = await prisma.circle.update({
      where: { id },
      data: toCircleData(parsed.data, geo.data),
    });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("regions", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update circle");
  }
}

export async function deleteCircle(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (session.user.role === Role.CIRCLE_ADMIN || session.user.role === Role.DIVISION_ADMIN) {
    return actionError("Insufficient permission to delete circles");
  }

  const before = await prisma.circle.findFirst({
    where: { id, ...circleScopeWhere(session.user) },
  });
  if (!before) return actionError("Circle not found");

  try {
    await prisma.circle.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("regions", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete circle");
  }
}
