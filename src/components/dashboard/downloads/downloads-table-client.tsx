"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DownloadKind } from "@prisma/client";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import {
  DOWNLOAD_KIND_LABELS,
  formatFileSize,
} from "@/lib/validators/download";
import { deleteDownload, publishDownload } from "@/server/actions/download";

export type DownloadRow = {
  id: string;
  title: string;
  kind: DownloadKind;
  fileSize: number | null;
  documentDate: string | null;
  downloadCount: number;
  status: string;
};

const columns: ColumnDef<DownloadRow, unknown>[] = [
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "kind",
    header: "Kind",
    cell: ({ row }) => (
      <span className="inline-flex rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
        {DOWNLOAD_KIND_LABELS[row.original.kind]}
      </span>
    ),
  },
  {
    id: "fileSize",
    accessorFn: (row) => row.fileSize ?? 0,
    header: "Size",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-moss">
        {formatFileSize(row.original.fileSize)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "documentDate",
    accessorFn: (row) => (row.documentDate ? new Date(row.documentDate).getTime() : 0),
    header: "Date",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-moss">
        {row.original.documentDate
          ? new Date(row.original.documentDate).toLocaleDateString()
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "downloadCount",
    header: "Downloads",
    cell: ({ row }) => (
      <span className="data font-mono text-xs tabular-nums text-bark">
        {row.original.downloadCount.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function DownloadsTableClient({ rows }: { rows: DownloadRow[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<string>("all");

  const filtered = useMemo(
    () => (kind === "all" ? rows : rows.filter((r) => r.kind === kind)),
    [rows, kind]
  );

  const actions: DataTableAction<DownloadRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/downloads/${row.id}` },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishDownload(row.id);
        if (result.ok) {
          toast.success("Published");
          router.refresh();
        } else toast.error(result.error);
      },
    },
    {
      label: "Delete",
      variant: "destructive",
      confirm: {
        title: "Delete download?",
        description: "This permanently removes the file entry from the public site.",
      },
      onClick: async (row) => {
        const result = await deleteDownload(row.id);
        if (result.ok) {
          toast.success("Deleted");
          router.refresh();
        } else toast.error(result.error);
      },
    },
  ];

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-bark">
        Kind
        <select
          className="h-9 rounded-[8px] border border-mist bg-paper px-2"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="all">All kinds</option>
          {Object.values(DownloadKind).map((k) => (
            <option key={k} value={k}>
              {DOWNLOAD_KIND_LABELS[k]}
            </option>
          ))}
        </select>
      </label>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(row) => row.id}
        actions={actions}
        searchPlaceholder="Filter downloads…"
        emptyMessage="No downloads yet."
      />
    </div>
  );
}
