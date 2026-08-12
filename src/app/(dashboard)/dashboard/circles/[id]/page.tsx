import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleScopeWhere, regionScopeWhere } from "@/lib/org-scope";
import { CircleForm } from "@/components/dashboard/organisation/circle-form";
import { stringifyMapGeoJson, type CircleInput } from "@/lib/validators/org";

type Props = { params: Promise<{ id: string }> };

export default async function EditCirclePage({ params }: Props) {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const { id } = await params;
  const [circle, regions] = await Promise.all([
    prisma.circle.findFirst({
      where: { id, ...circleScopeWhere(session.user) },
    }),
    prisma.region.findMany({
      where: regionScopeWhere(session.user),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!circle) notFound();

  const defaults: CircleInput = {
    regionId: circle.regionId,
    name: circle.name,
    nameUr: circle.nameUr,
    slug: circle.slug,
    headquarters: circle.headquarters,
    shortDesc: circle.shortDesc,
    description: circle.description,
    descriptionUr: circle.descriptionUr,
    coverImage: circle.coverImage,
    officerName: circle.officerName,
    officerDesignation: circle.officerDesignation,
    officerPhoto: circle.officerPhoto,
    contactPhone: circle.contactPhone,
    contactEmail: circle.contactEmail,
    address: circle.address,
    centerLat: circle.centerLat,
    centerLng: circle.centerLng,
    areaHectares: circle.areaHectares,
    orderIndex: circle.orderIndex,
    status: circle.status,
    mapGeoJson: stringifyMapGeoJson(circle.mapGeoJson),
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/circles" className="text-sm text-bark/60 hover:text-bark">
          ← Circles
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit circle</h1>
        <p className="mt-1 text-sm text-bark/60">{circle.name}</p>
      </div>
      <CircleForm mode="edit" circleId={circle.id} defaults={defaults} regions={regions} />
    </div>
  );
}
