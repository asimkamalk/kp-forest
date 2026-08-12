"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { deleteDivision } from "@/server/actions/organisation";

export type DivisionRow = {
  id: string;
  name: string;
  circleId: string;
  circleName: string;
  regionId: string;
  regionName: string;
  headquarters: string | null;
  officerName: string | null;
  status: string;
};

const columns: ColumnDef<DivisionRow, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "circleName", header: "Circle" },
  { accessorKey: "regionName", header: "Region" },
  {
    accessorKey: "headquarters",
    header: "HQ",
    cell: ({ row }) => row.original.headquarters ?? "—",
  },
  {
    accessorKey: "officerName",
    header: "DFO",
    cell: ({ row }) => row.original.officerName ?? "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

type Props = {
  rows: DivisionRow[];
  regions: { id: string; name: string }[];
  circles: { id: string; name: string; regionId: string }[];
};

export function DivisionsTableClient({ rows, regions, circles }: Props) {
  const router = useRouter();
  const [regionId, setRegionId] = useState("all");
  const [circleId, setCircleId] = useState("all");

  const circleOptions = useMemo(
    () =>
      regionId === "all" ? circles : circles.filter((c) => c.regionId === regionId),
    [circles, regionId]
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (regionId !== "all" && row.regionId !== regionId) return false;
      if (circleId !== "all" && row.circleId !== circleId) return false;
      return true;
    });
  }, [rows, regionId, circleId]);

  const actions: DataTableAction<DivisionRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/divisions/${row.id}` },
    {
      label: "Delete",
      variant: "destructive",
      confirm: {
        title: "Delete division?",
        description: "This permanently removes the division record.",
      },
      onClick: async (row) => {
        const result = await deleteDivision(row.id);
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
          Region
          <select
            className="h-9 rounded-[8px] border border-mist bg-paper px-2"
            value={regionId}
            onChange={(e) => {
              setRegionId(e.target.value);
              setCircleId("all");
            }}
          >
            <option value="all">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-bark">
          Circle
          <select
            className="h-9 rounded-[8px] border border-mist bg-paper px-2"
            value={circleId}
            onChange={(e) => setCircleId(e.target.value)}
          >
            <option value="all">All circles</option>
            {circleOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
        searchPlaceholder="Search divisions…"
      />
    </div>
  );
}
