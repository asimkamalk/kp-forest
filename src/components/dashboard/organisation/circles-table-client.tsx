"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { deleteCircle } from "@/server/actions/circle";

export type CircleRow = {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  headquarters: string | null;
  status: string;
  orderIndex: number;
};

const columns: ColumnDef<CircleRow, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "regionName", header: "Region" },
  {
    accessorKey: "headquarters",
    header: "HQ",
    cell: ({ row }) => row.original.headquarters ?? "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "orderIndex", header: "Order" },
];

type Props = {
  rows: CircleRow[];
  regions: { id: string; name: string }[];
};

export function CirclesTableClient({ rows, regions }: Props) {
  const router = useRouter();
  const [regionId, setRegionId] = useState("all");
  const filtered = useMemo(
    () => (regionId === "all" ? rows : rows.filter((r) => r.regionId === regionId)),
    [rows, regionId]
  );

  const actions: DataTableAction<CircleRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/circles/${row.id}` },
    {
      label: "Delete",
      variant: "destructive",
      confirm: {
        title: "Delete circle?",
        description: "This will cascade-delete divisions under it.",
      },
      onClick: async (row) => {
        const result = await deleteCircle(row.id);
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
        Region
        <select
          className="h-9 rounded-[8px] border border-mist bg-paper px-2"
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
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(row) => row.id}
        actions={actions}
        searchPlaceholder="Filter circles…"
      />
    </div>
  );
}
