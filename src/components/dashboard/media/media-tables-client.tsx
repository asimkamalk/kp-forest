"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { MediaKind } from "@prisma/client";
import { DataTable, StatusBadge, type DataTableAction } from "@/components/dashboard/data-table";
import {
  deleteGalleryAlbum,
  deleteMediaPost,
  publishMediaPost,
} from "@/server/actions/media";
import { cn } from "@/lib/utils";

export type MediaPostRow = {
  id: string;
  title: string;
  kind: MediaKind;
  publishedAt: string | null;
  status: string;
  hasVideo: boolean;
};

export type AlbumRow = {
  id: string;
  title: string;
  divisionName: string | null;
  imageCount: number;
  status: string;
};

type Tab = "press" | "albums" | "videos" | "news";

type Props = {
  posts: MediaPostRow[];
  albums: AlbumRow[];
};

const postColumns: ColumnDef<MediaPostRow, unknown>[] = [
  { accessorKey: "title", header: "Title" },
  {
    id: "publishedAt",
    accessorFn: (row) => (row.publishedAt ? new Date(row.publishedAt).getTime() : 0),
    header: "Published",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-moss">
        {row.original.publishedAt
          ? new Date(row.original.publishedAt).toLocaleDateString()
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

const albumColumns: ColumnDef<AlbumRow, unknown>[] = [
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "divisionName",
    header: "Division",
    cell: ({ row }) => row.original.divisionName ?? "—",
  },
  {
    accessorKey: "imageCount",
    header: "Images",
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums text-bark">
        {row.original.imageCount}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function MediaTablesClient({ posts, albums }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("press");

  const pressRows = useMemo(
    () => posts.filter((p) => p.kind === MediaKind.PRESS_RELEASE),
    [posts]
  );
  const newsRows = useMemo(
    () => posts.filter((p) => p.kind === MediaKind.NEWS_COVERAGE),
    [posts]
  );
  const videoRows = useMemo(
    () => posts.filter((p) => p.hasVideo),
    [posts]
  );

  const postActions = (editBase: string): DataTableAction<MediaPostRow>[] => [
    { label: "Edit", href: (row) => `${editBase}/${row.id}` },
    {
      label: "Publish",
      onClick: async (row) => {
        const result = await publishMediaPost(row.id);
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
        title: "Delete post?",
        description: "This permanently removes the item from the public site.",
      },
      onClick: async (row) => {
        const result = await deleteMediaPost(row.id);
        if (result.ok) {
          toast.success("Deleted");
          router.refresh();
        } else toast.error(result.error);
      },
    },
  ];

  const albumActions: DataTableAction<AlbumRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/media/albums/${row.id}` },
    {
      label: "Delete",
      variant: "destructive",
      confirm: {
        title: "Delete album?",
        description: "This removes the album and its image links.",
      },
      onClick: async (row) => {
        const result = await deleteGalleryAlbum(row.id);
        if (result.ok) {
          toast.success("Deleted");
          router.refresh();
        } else toast.error(result.error);
      },
    },
  ];

  const newHref =
    tab === "press"
      ? "/dashboard/media/press-releases/new"
      : tab === "news"
        ? "/dashboard/media/news/new"
        : tab === "videos"
          ? "/dashboard/media/videos/new"
          : "/dashboard/media/albums/new";

  const newLabel =
    tab === "press"
      ? "New press release"
      : tab === "news"
        ? "New news item"
        : tab === "videos"
          ? "New video"
          : "New album";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 border-b border-mist" role="tablist">
          {(
            [
              ["press", "Press releases"],
              ["albums", "Photo albums"],
              ["videos", "Videos"],
              ["news", "News"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "relative inline-flex h-11 items-center px-3 text-sm font-medium transition-colors",
                tab === id ? "text-bark" : "text-moss hover:text-bark"
              )}
            >
              {label}
              {tab === id && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-0.5 bg-resin"
                />
              )}
            </button>
          ))}
        </div>
        <Link
          href={newHref}
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          {newLabel}
        </Link>
      </div>

      {tab === "press" && (
        <DataTable
          columns={postColumns}
          data={pressRows}
          getRowId={(row) => row.id}
          actions={postActions("/dashboard/media/press-releases")}
          searchPlaceholder="Filter press releases…"
          emptyMessage="No press releases yet."
        />
      )}
      {tab === "albums" && (
        <DataTable
          columns={albumColumns}
          data={albums}
          getRowId={(row) => row.id}
          actions={albumActions}
          searchPlaceholder="Filter albums…"
          emptyMessage="No albums yet."
        />
      )}
      {tab === "videos" && (
        <DataTable
          columns={postColumns}
          data={videoRows}
          getRowId={(row) => row.id}
          actions={postActions("/dashboard/media/videos")}
          searchPlaceholder="Filter videos…"
          emptyMessage="No videos yet."
        />
      )}
      {tab === "news" && (
        <DataTable
          columns={postColumns}
          data={newsRows}
          getRowId={(row) => row.id}
          actions={postActions("/dashboard/media/news")}
          searchPlaceholder="Filter news…"
          emptyMessage="No news coverage yet."
        />
      )}
    </div>
  );
}
