import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regionScopeWhere } from "@/lib/org-scope";
import { RegionForm } from "@/components/dashboard/organisation/region-form";
import { stringifyMapGeoJson, type RegionInput } from "@/lib/validators/org";

type Props = { params: Promise<{ id: string }> };

export default async function EditRegionPage({ params }: Props) {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const { id } = await params;
  const region = await prisma.region.findFirst({
    where: { id, ...regionScopeWhere(session.user) },
  });
  if (!region) notFound();

  const defaults: RegionInput = {
    name: region.name,
    nameUr: region.nameUr,
    slug: region.slug,
    code: region.code,
    headquarters: region.headquarters,
    shortDesc: region.shortDesc,
    description: region.description,
    descriptionUr: region.descriptionUr,
    coverImage: region.coverImage,
    officerName: region.officerName,
    officerDesignation: region.officerDesignation,
    officerPhoto: region.officerPhoto,
    contactPhone: region.contactPhone,
    contactEmail: region.contactEmail,
    address: region.address,
    centerLat: region.centerLat,
    centerLng: region.centerLng,
    areaHectares: region.areaHectares,
    orderIndex: region.orderIndex,
    status: region.status,
    mapGeoJson: stringifyMapGeoJson(region.mapGeoJson),
    seoTitle: region.seoTitle,
    seoDescription: region.seoDescription,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/regions" className="text-sm text-bark/60 hover:text-bark">
          ← Regions
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit region</h1>
        <p className="mt-1 text-sm text-bark/60">{region.name}</p>
      </div>
      <RegionForm mode="edit" regionId={region.id} defaults={defaults} />
    </div>
  );
}
