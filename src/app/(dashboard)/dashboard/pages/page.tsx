import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PagesTableClient,
  type PageRow,
} from "@/components/dashboard/pages/pages-table-client";

export default async function PagesDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const pages = await prisma.page.findMany({
    orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
  });

  const rows: PageRow[] = pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: p.status,
    orderIndex: p.orderIndex,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Content</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Pages</h1>
          <p className="mt-2 text-sm text-moss">
            About pages and editable copy for public services.
          </p>
        </div>
        <Link
          href="/dashboard/pages/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New page
        </Link>
      </div>
      <PagesTableClient rows={rows} />
    </div>
  );
}
