import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DownloadsTableClient,
  type DownloadRow,
} from "@/components/dashboard/downloads/downloads-table-client";

export default async function DownloadsDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const downloads = await prisma.download.findMany({
    orderBy: [{ documentDate: "desc" }, { orderIndex: "asc" }],
  });

  const rows: DownloadRow[] = downloads.map((d) => ({
    id: d.id,
    title: d.title,
    kind: d.kind,
    fileSize: d.fileSize,
    documentDate: d.documentDate?.toISOString() ?? null,
    downloadCount: d.downloadCount,
    status: d.status,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Downloads</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Downloads</h1>
        </div>
        <Link
          href="/dashboard/downloads/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New download
        </Link>
      </div>

      <DownloadsTableClient rows={rows} />
    </div>
  );
}
