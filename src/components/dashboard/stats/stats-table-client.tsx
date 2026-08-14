"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { deleteStatCounter, publishStatCounter } from "@/server/actions/stat";

export type StatRow = {
  id: string;
  label: string;
  value: number;
  prefix: string | null;
  suffix: string | null;
  status: string;
  orderIndex: number;
};

function formatDisplay(row: StatRow) {
  return `${row.prefix ?? ""}${row.value.toLocaleString("en-GB")}${row.suffix ?? ""}`;
}

const columns: ColumnDef<StatRow, unknown>[] = [
  { accessorKey: "label", header: "Label" },
  {
    id: "display",
    header: "Display",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-bark">{formatDisplay(row.original)}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "orderIndex", header: "Order" },
];

export function StatsTableClient({ rows }: { rows: StatRow[] }) {
  const router = useRouter();

  const actions: DataTableAction<StatRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/stats/${row.id}` },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishStatCounter(row.id);
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
        title: "Delete statistic?",
        description: "This removes the figure from the public homepage stats band.",
      },
      onClick: async (row) => {
        const result = await deleteStatCounter(row.id);
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
      searchPlaceholder="Filter statistics…"
    />
  );
}
