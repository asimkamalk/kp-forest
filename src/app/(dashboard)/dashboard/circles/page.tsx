import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleWhere, regionWhere } from "@/lib/org-scope";
import {
  CirclesTableClient,
  type CircleRow,
} from "@/components/dashboard/organisation/circles-table-client";

export default async function CirclesDashboardPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN
  );

  const [circles, regions] = await Promise.all([
    prisma.circle.findMany({
      where: circleWhere(session),
      orderBy: { orderIndex: "asc" },
      include: {
        region: { select: { id: true, name: true } },
        _count: { select: { divisions: true } },
      },
    }),
    prisma.region.findMany({
      where: regionWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: CircleRow[] = circles.map((c) => ({
    id: c.id,
    name: c.name,
    regionId: c.regionId,
    regionName: c.region.name,
    headquarters: c.headquarters,
    divisionCount: c._count.divisions,
    status: c.status,
  }));

  const canCreate =
    session.user.role === Role.SUPER_ADMIN || session.user.role === Role.REGION_ADMIN;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Organisation</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Circles</h1>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/circles/new"
            className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
          >
            New circle
          </Link>
        )}
      </div>
      <CirclesTableClient rows={rows} regions={regions} />
    </div>
  );
}
