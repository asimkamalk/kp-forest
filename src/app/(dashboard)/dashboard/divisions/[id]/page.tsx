import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleWhere, divisionWhere } from "@/lib/org-scope";
import { DivisionForm } from "@/components/dashboard/organisation/division-form";
import { stringifyMapGeoJson, type DivisionInput } from "@/lib/validators/organisation";

type Props = { params: Promise<{ id: string }> };

export default async function EditDivisionPage({ params }: Props) {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const { id } = await params;
  const [division, circles] = await Promise.all([
    prisma.division.findFirst({
      where: { id, ...divisionWhere(session) },
    }),
    prisma.circle.findMany({
      where: circleWhere(session),
      orderBy: { orderIndex: "asc" },
      include: { region: { select: { name: true } } },
    }),
  ]);
  if (!division) notFound();

  const defaults: DivisionInput = {
    circleId: division.circleId,
    name: division.name,
    nameUr: division.nameUr,
    slug: division.slug,
    headquarters: division.headquarters,
    forestType: division.forestType,
    shortDesc: division.shortDesc,
    description: division.description,
    descriptionUr: division.descriptionUr,
    coverImage: division.coverImage,
    officerName: division.officerName,
    officerDesignation: division.officerDesignation,
    officerPhoto: division.officerPhoto,
    contactPhone: division.contactPhone,
    contactEmail: division.contactEmail,
    address: division.address,
    centerLat: division.centerLat,
    centerLng: division.centerLng,
    areaHectares: division.areaHectares,
    orderIndex: division.orderIndex,
    status: division.status,
    mapGeoJson: stringifyMapGeoJson(division.mapGeoJson),
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/divisions" className="text-sm text-bark/60 hover:text-bark">
          ← Divisions
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit division</h1>
        <p className="mt-1 text-sm text-bark/60">{division.name}</p>
      </div>
      <DivisionForm
        mode="edit"
        divisionId={division.id}
        defaults={defaults}
        circles={circles.map((c) => ({
          id: c.id,
          name: c.name,
          regionName: c.region.name,
        }))}
      />
    </div>
  );
}
