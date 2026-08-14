import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  StatsTableClient,
  type StatRow,
} from "@/components/dashboard/stats/stats-table-client";
import { StatsReorderList } from "@/components/dashboard/stats/stats-reorder-list";

export default async function StatsDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const counters = await prisma.statCounter.findMany({
    orderBy: { orderIndex: "asc" },
  });

  const rows: StatRow[] = counters.map((c) => ({
    id: c.id,
    label: c.label,
    value: c.value,
    prefix: c.prefix,
    suffix: c.suffix,
    status: c.status,
    orderIndex: c.orderIndex,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Content</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Homepage stats</h1>
          <p className="mt-1 max-w-xl text-sm text-moss">
            Figures on the homepage band. These are editorial numbers, not live counts of
            regions, circles or divisions.
          </p>
        </div>
        <Link
          href="/dashboard/stats/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New statistic
        </Link>
      </div>

      <StatsTableClient rows={rows} />

      <section>
        <h2 className="mb-3 font-sans text-sm font-semibold text-bark">Reorder</h2>
        <StatsReorderList
          items={counters.map((c) => ({
            id: c.id,
            label: c.label,
            status: c.status,
          }))}
        />
      </section>
    </div>
  );
}
