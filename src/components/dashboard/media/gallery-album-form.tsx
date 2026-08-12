"use client";

import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import {
  galleryAlbumSchema,
  type GalleryAlbumInput,
} from "@/lib/validators/media";
import { createGalleryAlbum, updateGalleryAlbum } from "@/server/actions/media";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

export type DivisionOption = {
  id: string;
  name: string;
};

type Props = {
  mode: "create" | "edit";
  albumId?: string;
  defaults: GalleryAlbumInput;
  divisions: DivisionOption[];
};

export function GalleryAlbumForm({ mode, albumId, defaults, divisions }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<GalleryAlbumInput>[] = [
    { name: "title", label: "Title", tab: "en" },
    { name: "titleUr", label: "Title (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      tab: "en",
      rows: 4,
    },
    {
      name: "divisionId",
      label: "Division",
      type: "select",
      tab: "all",
      options: divisions.map((d) => ({ label: d.name, value: d.id })),
    },
    {
      name: "coverImage",
      label: "Cover image",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
        />
      ),
    },
    { name: "orderIndex", label: "Order", type: "number", tab: "all" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
      tab: "all",
    },
  ];

  return (
    <ResourceForm
      schema={galleryAlbumSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      autoSlug
      submitLabel={mode === "create" ? "Create album" : "Save album"}
      preview={(values) => (
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-resin">
            Photo album
          </p>
          <p className="font-sans text-sm font-medium text-bark">
            {values.title || "Untitled album"}
          </p>
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createGalleryAlbum(values)
            : await updateGalleryAlbum(albumId!, values);
        if (result.ok) {
          if (mode === "create" && result.data?.id) {
            router.push(`/dashboard/media/albums/${result.data.id}`);
          } else {
            router.push("/dashboard/media");
          }
          router.refresh();
        }
        return result;
      }}
      onCancel={() => router.push("/dashboard/media")}
    />
  );
}
