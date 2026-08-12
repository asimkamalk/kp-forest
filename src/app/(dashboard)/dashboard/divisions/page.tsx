import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleWhere, divisionWhere, regionWhere } from "@/lib/org-scope";
import {
  DivisionsTableClient,
  type DivisionRow,
} from "@/components/dashboard/organisation/divisions-table-client";

export default async function DivisionsDashboardPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const [divisions, regions, circles] = await Promise.all([
    prisma.division.findMany({
      where: divisionWhere(session),
      orderBy: { orderIndex: "asc" },
      include: {
        circle: {
          select: {
            id: true,
            name: true,
            regionId: true,
            region: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.region.findMany({
      where: regionWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
    prisma.circle.findMany({
      where: circleWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, regionId: true },
    }),
  ]);

  const rows: DivisionRow[] = divisions.map((d) => ({
    id: d.id,
    name: d.name,
    circleId: d.circleId,
    circleName: d.circle.name,
    regionId: d.circle.regionId,
    regionName: d.circle.region.name,
    headquarters: d.headquarters,
    officerName: d.officerName,
    status: d.status,
  }));

  const canCreate = session.user.role !== Role.DIVISION_ADMIN;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Organisation</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Divisions</h1>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/divisions/new"
            className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
          >
            New division
          </Link>
        )}
      </div>
      <DivisionsTableClient rows={rows} regions={regions} circles={circles} />
    </div>
  );
}
