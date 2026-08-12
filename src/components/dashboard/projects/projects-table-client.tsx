"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { ProjectStatus } from "@prisma/client";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { PROJECT_STATUS_LABELS } from "@/lib/validators/project";
import { deleteProject, publishProject } from "@/server/actions/project";

export type ProjectRow = {
  id: string;
  title: string;
  projectStatus: ProjectStatus;
  owner: string | null;
  regionId: string | null;
  progressPct: number;
  costPkr: number | null;
  status: string;
};

const columns: ColumnDef<ProjectRow, unknown>[] = [
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "projectStatus",
    header: "Status",
    cell: ({ row }) => (
      <span className="inline-flex rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
        {PROJECT_STATUS_LABELS[row.original.projectStatus]}
      </span>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => row.original.owner ?? "—",
  },
  {
    accessorKey: "progressPct",
    header: "Progress",
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums text-moss">
        {row.original.progressPct}%
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Publish",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

type Props = {
  rows: ProjectRow[];
  regions: { id: string; name: string }[];
};

export function ProjectsTableClient({ rows, regions }: Props) {
  const router = useRouter();
  const [projectStatus, setProjectStatus] = useState("all");
  const [regionId, setRegionId] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (projectStatus !== "all" && r.projectStatus !== projectStatus) return false;
      if (regionId !== "all" && r.regionId !== regionId) return false;
      return true;
    });
  }, [rows, projectStatus, regionId]);

  const actions: DataTableAction<ProjectRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/projects/${row.id}` },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishProject(row.id);
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
        title: "Delete project?",
        description: "This permanently removes the project from the public site.",
      },
      onClick: async (row) => {
        const result = await deleteProject(row.id);
        if (result.ok) {
          toast.success("Deleted");
          router.refresh();
        } else toast.error(result.error);
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-bark">
          Status
          <select
            className="h-9 rounded-[8px] border border-mist bg-paper px-2"
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
          >
            <option value="all">All</option>
            {Object.values(ProjectStatus).map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-bark">
          Region
          <select
            className="h-9 max-w-[200px] rounded-[8px] border border-mist bg-paper px-2"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
          >
            <option value="all">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(row) => row.id}
        actions={actions}
        searchPlaceholder="Filter projects…"
        emptyMessage="No projects yet."
      />
    </div>
  );
}
