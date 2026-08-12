import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { RegionForm } from "@/components/dashboard/organisation/region-form";
import type { RegionInput } from "@/lib/validators/org";

const defaults: RegionInput = {
  name: "",
  nameUr: "",
  slug: "",
  code: "",
  headquarters: "",
  shortDesc: "",
  description: "",
  descriptionUr: "",
  coverImage: null,
  officerName: "",
  officerDesignation: "",
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
  seoTitle: "",
  seoDescription: "",
};

export default async function NewRegionPage() {
  await requireRole(Role.SUPER_ADMIN);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/regions" className="text-sm text-bark/60 hover:text-bark">
          ← Regions
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New region</h1>
      </div>
      <RegionForm mode="create" defaults={defaults} />
    </div>
  );
}
