import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regionScopeWhere } from "@/lib/org-scope";
import { CircleForm } from "@/components/dashboard/organisation/circle-form";
import type { CircleInput } from "@/lib/validators/org";

export default async function NewCirclePage() {
  const session = await requireRole(Role.SUPER_ADMIN, Role.REGION_ADMIN);

  const regions = await prisma.region.findMany({
    where: regionScopeWhere(session.user),
    orderBy: { orderIndex: "asc" },
    select: { id: true, name: true },
  });

  const defaults: CircleInput = {
    regionId: regions[0]?.id ?? "",
    name: "",
    nameUr: "",
    slug: "",
    headquarters: "",
    shortDesc: "",
    description: "",
    descriptionUr: "",
    coverImage: null,
    officerName: "",
    officerDesignation: "Conservator of Forests",
    officerPhoto: null,
    contactPhone: "",
    contactEmail: "",
    address: "",
    centerLat: null,
    centerLng: null,
    areaHectares: null,
    orderIndex: 0,
    status: PublishStatus.PUBLISHED,
    mapGeoJson: "",
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/circles" className="text-sm text-bark/60 hover:text-bark">
          ← Circles
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New circle</h1>
      </div>
      <CircleForm mode="create" defaults={defaults} regions={regions} />
    </div>
  );
}
