"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { deleteRegion } from "@/server/actions/organisation";

export type RegionRow = {
  id: string;
  code: string;
  name: string;
  headquarters: string;
  circleCount: number;
  divisionCount: number;
  status: string;
};

const columns: ColumnDef<RegionRow, unknown>[] = [
  { accessorKey: "code", header: "Code" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "headquarters", header: "HQ" },
  { accessorKey: "circleCount", header: "Circles" },
  { accessorKey: "divisionCount", header: "Divisions" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function RegionsTableClient({ rows }: { rows: RegionRow[] }) {
  const router = useRouter();

  const actions: DataTableAction<RegionRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/regions/${row.id}` },
    {
      label: "Delete",
      variant: "destructive",
      confirm: {
        title: "Delete region?",
        description: "Blocked if the region still has circles.",
      },
      onClick: async (row) => {
        const result = await deleteRegion(row.id);
        if (result.ok) {
          toast.success("Deleted");
          router.refresh();
        } else toast.error(result.error);
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      actions={actions}
      searchPlaceholder="Filter regions…"
    />
  );
}
