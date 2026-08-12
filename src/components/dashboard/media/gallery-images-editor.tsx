"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { SortableList } from "@/components/dashboard/sortable-list";
import {
  addGalleryImages,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageCaption,
} from "@/server/actions/media";

export type GalleryImageRow = {
  id: string;
  url: string;
  caption: string | null;
  captionUr: string | null;
  orderIndex: number;
};

type Props = {
  albumId: string;
  images: GalleryImageRow[];
};

export function GalleryImagesEditor({ albumId, images }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [captions, setCaptions] = useState<
    Record<string, { caption: string; captionUr: string }>
  >({});

  useEffect(() => {
    const next: Record<string, { caption: string; captionUr: string }> = {};
    for (const img of images) {
      next[img.id] = {
        caption: img.caption ?? "",
        captionUr: img.captionUr ?? "",
      };
    }
    setCaptions(next);
  }, [images]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const assetIds: string[] = [];
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { id: string };
      };
      if (!json.ok || !json.data) {
        toast.error(json.error ?? "Upload failed");
        return;
      }
      assetIds.push(json.data.id);
    }

    startTransition(async () => {
      const result = await addGalleryImages({ albumId, assetIds });
      if (result.ok) {
        toast.success(`Added ${result.data.count} image${result.data.count === 1 ? "" : "s"}`);
        router.refresh();
      } else toast.error(result.error);
    });
  };

  const saveCaption = (id: string) => {
    const values = captions[id];
    if (!values) return;
    startTransition(async () => {
      const result = await updateGalleryImageCaption(id, values);
      if (result.ok) {
        toast.success("Caption saved");
        router.refresh();
      } else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4 rounded-[12px] border border-mist bg-paper p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-bark">Album images</h2>
          <p className="text-sm text-moss">
            Drag to reorder. Captions save per image.
          </p>
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-mist px-3 text-sm text-bark hover:bg-mist/40">
          <Upload className="h-4 w-4" aria-hidden />
          {pending ? "Uploading…" : "Add images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            disabled={pending}
            onChange={(e) => {
              void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-moss">No images yet. Upload one or more.</p>
      ) : (
        <SortableList
          parentId={albumId}
          onReorder={reorderGalleryImages}
          items={images.map((img) => ({
            id: img.id,
            label: img.caption || `Image ${img.orderIndex + 1}`,
            meta: (
              <span className="relative inline-block h-10 w-14 overflow-hidden rounded-[6px] border border-mist">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </span>
            ),
            below: (
              <div className="space-y-2 border-t border-mist px-3 py-3">
                <label className="block text-xs text-moss">
                  Caption
                  <input
                    className="mt-1 h-9 w-full rounded-[8px] border border-mist bg-paper px-2 text-sm text-bark"
                    value={captions[img.id]?.caption ?? ""}
                    onChange={(e) =>
                      setCaptions((prev) => ({
                        ...prev,
                        [img.id]: {
                          caption: e.target.value,
                          captionUr: prev[img.id]?.captionUr ?? "",
                        },
                      }))
                    }
                  />
                </label>
                <label className="block text-xs text-moss">
                  Caption (Urdu)
                  <input
                    dir="rtl"
                    className="mt-1 h-9 w-full rounded-[8px] border border-mist bg-paper px-2 text-sm text-bark"
                    value={captions[img.id]?.captionUr ?? ""}
                    onChange={(e) =>
                      setCaptions((prev) => ({
                        ...prev,
                        [img.id]: {
                          caption: prev[img.id]?.caption ?? "",
                          captionUr: e.target.value,
                        },
                      }))
                    }
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="h-8 rounded-[8px] bg-deodar px-3 text-xs font-medium text-paper"
                    onClick={() => saveCaption(img.id)}
                    disabled={pending}
                  >
                    Save captions
                  </button>
                  <button
                    type="button"
                    className="h-8 rounded-[8px] px-3 text-xs text-resin hover:bg-resin/10"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await deleteGalleryImage(img.id);
                        if (result.ok) {
                          toast.success("Image removed");
                          router.refresh();
                        } else toast.error(result.error);
                      });
                    }}
                    disabled={pending}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ),
          }))}
        />
      )}
    </div>
  );
}
