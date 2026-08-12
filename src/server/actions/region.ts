"use server";

import { revalidateTag } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regionScopeWhere } from "@/lib/org-scope";
import { parseMapGeoJson, regionSchema } from "@/lib/validators/org";
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
      entity: "Region",
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

function toRegionData(input: ReturnType<typeof regionSchema.parse>, mapGeoJson: object | null) {
  const { mapGeoJson: _ignored, ...rest } = input;
  return {
    ...rest,
    mapGeoJson:
      mapGeoJson === null
        ? Prisma.JsonNull
        : (mapGeoJson as Prisma.InputJsonValue),
  };
}

export async function createRegion(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (session.user.role !== Role.SUPER_ADMIN) {
    return actionError("Only super admins can create regions");
  }

  const parsed = regionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  try {
    const row = await prisma.region.create({
      data: toRegionData(parsed.data, geo.data),
    });
    await writeAudit(session.user.id, "CREATE", row.id, null, row);
    revalidateTag("regions", "max");
    revalidateTag("nav", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not create region");
  }
}

export async function updateRegion(
  id: string,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  const parsed = regionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const before = await prisma.region.findFirst({
    where: { id, ...regionScopeWhere(session.user) },
  });
  if (!before) return actionError("Region not found");

  try {
    const row = await prisma.region.update({
      where: { id },
      data: toRegionData(parsed.data, geo.data),
    });
    await writeAudit(session.user.id, "UPDATE", row.id, before, row);
    revalidateTag("regions", "max");
    revalidateTag("nav", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update region");
  }
}

export async function deleteRegion(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (session.user.role !== Role.SUPER_ADMIN) {
    return actionError("Only super admins can delete regions");
  }

  const before = await prisma.region.findUnique({ where: { id } });
  if (!before) return actionError("Region not found");

  try {
    await prisma.region.delete({ where: { id } });
    await writeAudit(session.user.id, "DELETE", id, before, null);
    revalidateTag("regions", "max");
    revalidateTag("nav", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete region");
  }
}
