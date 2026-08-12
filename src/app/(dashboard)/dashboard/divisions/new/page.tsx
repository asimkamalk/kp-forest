import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleWhere } from "@/lib/org-scope";
import { DivisionForm } from "@/components/dashboard/organisation/division-form";
import type { DivisionInput } from "@/lib/validators/organisation";

export default async function NewDivisionPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN
  );

  const circles = await prisma.circle.findMany({
    where: circleWhere(session),
    orderBy: { orderIndex: "asc" },
    include: { region: { select: { name: true } } },
  });

  const defaults: DivisionInput = {
    circleId: circles[0]?.id ?? "",
    name: "",
    nameUr: "",
    slug: "",
    headquarters: "",
    forestType: "",
    shortDesc: "",
    description: "",
    descriptionUr: "",
    coverImage: null,
    officerName: "",
    officerDesignation: "Divisional Forest Officer",
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
        <Link href="/dashboard/divisions" className="text-sm text-bark/60 hover:text-bark">
          ← Divisions
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New division</h1>
      </div>
      <DivisionForm
        mode="create"
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
