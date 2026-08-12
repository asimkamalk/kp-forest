"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { deletePage, publishPage } from "@/server/actions/pages";

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  orderIndex: number;
  updatedAt: string;
};

const columns: ColumnDef<PageRow, unknown>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "orderIndex", header: "Order" },
  {
    id: "updatedAt",
    accessorFn: (row) => new Date(row.updatedAt).getTime(),
    header: "Updated",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-moss">
        {new Date(row.original.updatedAt).toLocaleDateString()}
      </span>
    ),
  },
];

export function PagesTableClient({ rows }: { rows: PageRow[] }) {
  const router = useRouter();

  const actions: DataTableAction<PageRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/pages/${row.id}` },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishPage(row.id);
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
        title: "Delete page?",
        description: "This permanently removes the CMS page.",
      },
      onClick: async (row) => {
        const result = await deletePage(row.id);
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
      searchPlaceholder="Filter by title or slug…"
    />
  );
}
