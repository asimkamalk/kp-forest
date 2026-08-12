import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  HeroTableClient,
  type HeroRow,
} from "@/components/dashboard/hero/hero-table-client";
import { HeroReorderList } from "@/components/dashboard/hero/hero-reorder-list";

export default async function HeroDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const slides = await prisma.heroSlide.findMany({
    orderBy: { orderIndex: "asc" },
  });

  const rows: HeroRow[] = slides.map((s) => ({
    id: s.id,
    title: s.title,
    imageUrl: s.imageUrl,
    status: s.status,
    orderIndex: s.orderIndex,
    startsAt: s.startsAt?.toISOString() ?? null,
    endsAt: s.endsAt?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Content</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Hero slides</h1>
        </div>
        <Link
          href="/dashboard/hero/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New slide
        </Link>
      </div>

      <HeroTableClient rows={rows} />

      <section>
        <h2 className="mb-3 font-sans text-sm font-semibold text-bark">Reorder</h2>
        <HeroReorderList
          items={slides.map((s) => ({
            id: s.id,
            label: s.title,
            status: s.status,
          }))}
        />
      </section>
    </div>
  );
}
