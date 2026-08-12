import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { regionWhere } from "@/lib/org-scope";
import {
  RegionsTableClient,
  type RegionRow,
} from "@/components/dashboard/organisation/regions-table-client";

export default async function RegionsDashboardPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const regions = await prisma.region.findMany({
    where: regionWhere(session),
    orderBy: { orderIndex: "asc" },
    include: {
      _count: { select: { circles: true } },
      circles: { select: { _count: { select: { divisions: true } } } },
    },
  });

  const rows: RegionRow[] = regions.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    headquarters: r.headquarters,
    circleCount: r._count.circles,
    divisionCount: r.circles.reduce((sum, c) => sum + c._count.divisions, 0),
    status: r.status,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Organisation</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Regions</h1>
        </div>
        {session.user.role === Role.SUPER_ADMIN && (
          <Link
            href="/dashboard/regions/new"
            className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
          >
            New region
          </Link>
        )}
      </div>
      <RegionsTableClient rows={rows} />
    </div>
  );
}
