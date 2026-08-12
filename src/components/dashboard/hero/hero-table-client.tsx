"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import {
  deleteHeroSlide,
  duplicateHeroSlide,
  publishHeroSlide,
} from "@/server/actions/hero";

export type HeroRow = {
  id: string;
  title: string;
  imageUrl: string;
  status: string;
  orderIndex: number;
  startsAt: string | null;
  endsAt: string | null;
};

function formatSchedule(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) return "Always";
  const start = startsAt ? new Date(startsAt).toLocaleDateString() : "…";
  const end = endsAt ? new Date(endsAt).toLocaleDateString() : "…";
  return `${start} → ${end}`;
}

const columns: ColumnDef<HeroRow, unknown>[] = [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative h-10 w-16 overflow-hidden rounded bg-mist">
        <Image src={row.original.imageUrl} alt="" fill className="object-cover" sizes="64px" />
      </div>
    ),
    enableSorting: false,
  },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "orderIndex", header: "Order" },
  {
    id: "schedule",
    header: "Schedule",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-moss">
        {formatSchedule(row.original.startsAt, row.original.endsAt)}
      </span>
    ),
    enableSorting: false,
  },
];

export function HeroTableClient({ rows }: { rows: HeroRow[] }) {
  const router = useRouter();

  const actions: DataTableAction<HeroRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/hero/${row.id}` },
    {
      label: "Duplicate",
      onClick: async (row) => {
        const result = await duplicateHeroSlide(row.id);
        if (result.ok) {
          toast.success("Duplicated");
          router.refresh();
        } else toast.error(result.error);
      },
    },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishHeroSlide(row.id);
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
        title: "Delete slide?",
        description: "This removes the slide from the public homepage carousel.",
      },
      onClick: async (row) => {
        const result = await deleteHeroSlide(row.id);
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
      searchPlaceholder="Filter slides…"
    />
  );
}
