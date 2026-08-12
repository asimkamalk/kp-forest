"use server";

import { revalidateTag } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleWhere, divisionWhere, regionWhere } from "@/lib/org-scope";
import {
  circleSchema,
  divisionSchema,
  parseMapGeoJson,
  regionSchema,
} from "@/lib/validators/organisation";
import { actionError, actionOk, type ActionResult } from "@/server/actions/types";

const ORG_ROLES = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
] as const;

async function writeAudit(
  userId: string,
  entity: string,
  action: string,
  entityId: string,
  before: unknown,
  after: unknown
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      before: before as object | undefined,
      after: after as object | undefined,
    },
  });
}

function jsonField(value: object | null) {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

/* --------------------------------- REGION -------------------------------- */

export async function createRegion(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (session.user.role !== Role.SUPER_ADMIN) {
    return actionError("Only super admins can create regions");
  }

  const parsed = regionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const slugTaken = await prisma.region.findFirst({
    where: { OR: [{ slug: parsed.data.slug }, { code: parsed.data.code }] },
  });
  if (slugTaken) {
    return actionError(
      slugTaken.slug === parsed.data.slug
        ? "A region with this slug already exists"
        : "A region with this code already exists"
    );
  }

  try {
    const { mapGeoJson: _m, ...rest } = parsed.data;
    const row = await prisma.region.create({
      data: { ...rest, mapGeoJson: jsonField(geo.data) },
    });
    await writeAudit(session.user.id, "Region", "CREATE", row.id, null, row);
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
    where: { id, ...regionWhere(session) },
  });
  if (!before) return actionError("Region not found");

  const clash = await prisma.region.findFirst({
    where: {
      id: { not: id },
      OR: [{ slug: parsed.data.slug }, { code: parsed.data.code }],
    },
  });
  if (clash) {
    return actionError(
      clash.slug === parsed.data.slug
        ? "A region with this slug already exists"
        : "A region with this code already exists"
    );
  }

  try {
    const { mapGeoJson: _m, ...rest } = parsed.data;
    const row = await prisma.region.update({
      where: { id },
      data: { ...rest, mapGeoJson: jsonField(geo.data) },
    });
    await writeAudit(session.user.id, "Region", "UPDATE", row.id, before, row);
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

  const before = await prisma.region.findUnique({
    where: { id },
    include: { _count: { select: { circles: true } } },
  });
  if (!before) return actionError("Region not found");

  if (before._count.circles > 0) {
    return actionError(
      `Cannot delete “${before.name}” — it still has ${before._count.circles} circle${before._count.circles === 1 ? "" : "s"}.`
    );
  }

  try {
    await prisma.region.delete({ where: { id } });
    await writeAudit(session.user.id, "Region", "DELETE", id, before, null);
    revalidateTag("regions", "max");
    revalidateTag("nav", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete region");
  }
}

/* --------------------------------- CIRCLE -------------------------------- */

export async function createCircle(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (
    session.user.role === Role.CIRCLE_ADMIN ||
    session.user.role === Role.DIVISION_ADMIN
  ) {
    return actionError("Insufficient permission to create circles");
  }

  const parsed = circleSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const region = await prisma.region.findFirst({
    where: { id: parsed.data.regionId, ...regionWhere(session) },
  });
  if (!region) return actionError("Region not found or out of scope");

  const slugTaken = await prisma.circle.findFirst({
    where: { regionId: parsed.data.regionId, slug: parsed.data.slug },
  });
  if (slugTaken) {
    return actionError("A circle with this slug already exists in that region");
  }

  try {
    const { mapGeoJson: _m, ...rest } = parsed.data;
    const row = await prisma.circle.create({
      data: { ...rest, mapGeoJson: jsonField(geo.data) },
    });
    await writeAudit(session.user.id, "Circle", "CREATE", row.id, null, row);
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
    where: { id, ...circleWhere(session) },
  });
  if (!before) return actionError("Circle not found");

  const region = await prisma.region.findFirst({
    where: { id: parsed.data.regionId, ...regionWhere(session) },
  });
  if (!region) return actionError("Region not found or out of scope");

  const slugTaken = await prisma.circle.findFirst({
    where: {
      id: { not: id },
      regionId: parsed.data.regionId,
      slug: parsed.data.slug,
    },
  });
  if (slugTaken) {
    return actionError("A circle with this slug already exists in that region");
  }

  try {
    const { mapGeoJson: _m, ...rest } = parsed.data;
    const row = await prisma.circle.update({
      where: { id },
      data: { ...rest, mapGeoJson: jsonField(geo.data) },
    });
    await writeAudit(session.user.id, "Circle", "UPDATE", row.id, before, row);
    revalidateTag("regions", "max");
    return actionOk({ id: row.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not update circle");
  }
}

export async function deleteCircle(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (
    session.user.role === Role.CIRCLE_ADMIN ||
    session.user.role === Role.DIVISION_ADMIN
  ) {
    return actionError("Insufficient permission to delete circles");
  }

  const before = await prisma.circle.findFirst({
    where: { id, ...circleWhere(session) },
    include: { _count: { select: { divisions: true } } },
  });
  if (!before) return actionError("Circle not found");

  if (before._count.divisions > 0) {
    return actionError(
      `Cannot delete “${before.name}” — it still has ${before._count.divisions} division${before._count.divisions === 1 ? "" : "s"}.`
    );
  }

  try {
    await prisma.circle.delete({ where: { id } });
    await writeAudit(session.user.id, "Circle", "DELETE", id, before, null);
    revalidateTag("regions", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete circle");
  }
}

/* -------------------------------- DIVISION ------------------------------- */

export async function createDivision(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireRole(...ORG_ROLES);
  if (session.user.role === Role.DIVISION_ADMIN) {
    return actionError("Insufficient permission to create divisions");
  }

  const parsed = divisionSchema.safeParse(input);
  if (!parsed.success) return actionError(parsed.error.issues[0]?.message ?? "Invalid input");
  const geo = parseMapGeoJson(parsed.data.mapGeoJson);
  if (!geo.ok) return actionError(geo.error);

  const circle = await prisma.circle.findFirst({
    where: { id: parsed.data.circleId, ...circleWhere(session) },
  });
  if (!circle) return actionError("Circle not found or out of scope");

  const slugTaken = await prisma.division.findFirst({
    where: { circleId: parsed.data.circleId, slug: parsed.data.slug },
  });
  if (slugTaken) {
    return actionError("A division with this slug already exists in that circle");
  }

  try {
    const { mapGeoJson: _m, ...rest } = parsed.data;
    const row = await prisma.division.create({
      data: { ...rest, mapGeoJson: jsonField(geo.data) },
    });
    await writeAudit(session.user.id, "Division", "CREATE", row.id, null, row);
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
    where: { id, ...divisionWhere(session) },
  });
  if (!before) return actionError("Division not found");

  const circle = await prisma.circle.findFirst({
    where: { id: parsed.data.circleId, ...circleWhere(session) },
  });
  if (!circle) return actionError("Circle not found or out of scope");

  const slugTaken = await prisma.division.findFirst({
    where: {
      id: { not: id },
      circleId: parsed.data.circleId,
      slug: parsed.data.slug,
    },
  });
  if (slugTaken) {
    return actionError("A division with this slug already exists in that circle");
  }

  try {
    const { mapGeoJson: _m, ...rest } = parsed.data;
    const row = await prisma.division.update({
      where: { id },
      data: { ...rest, mapGeoJson: jsonField(geo.data) },
    });
    await writeAudit(session.user.id, "Division", "UPDATE", row.id, before, row);
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
    where: { id, ...divisionWhere(session) },
  });
  if (!before) return actionError("Division not found");

  try {
    await prisma.division.delete({ where: { id } });
    await writeAudit(session.user.id, "Division", "DELETE", id, before, null);
    revalidateTag("regions", "max");
    return actionOk({ id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Could not delete division");
  }
}
