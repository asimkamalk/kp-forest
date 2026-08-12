"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import { deleteMessage, publishMessage } from "@/server/actions/message";

export type MessageRow = {
  id: string;
  slug: string;
  personName: string;
  designation: string;
  photoUrl: string | null;
  status: string;
  orderIndex: number;
};

const columns: ColumnDef<MessageRow, unknown>[] = [
  {
    accessorKey: "photoUrl",
    header: "Photo",
    cell: ({ row }) =>
      row.original.photoUrl ? (
        <div className="relative h-10 w-8 overflow-hidden rounded bg-mist">
          <Image src={row.original.photoUrl} alt="" fill className="object-cover" sizes="32px" />
        </div>
      ) : (
        <div className="grid h-10 w-8 place-items-center rounded bg-deodar text-xs text-paper">
          {row.original.personName.slice(0, 1)}
        </div>
      ),
    enableSorting: false,
  },
  { accessorKey: "personName", header: "Name" },
  { accessorKey: "designation", header: "Designation" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "orderIndex", header: "Order" },
];

export function MessagesTableClient({ rows }: { rows: MessageRow[] }) {
  const router = useRouter();

  const actions: DataTableAction<MessageRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/messages/${row.id}` },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishMessage(row.id);
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
        title: "Delete message?",
        description: "This permanently removes the message from the public site.",
      },
      onClick: async (row) => {
        const result = await deleteMessage(row.id);
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
      searchPlaceholder="Filter by name…"
    />
  );
}
