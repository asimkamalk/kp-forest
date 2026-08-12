"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Asset = {
  id: string;
  url: string;
  fileName: string;
};

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export function ImagePicker({ value, onChange, label = "Choose image" }: Props) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const res = await fetch("/api/media-assets");
      if (!res.ok) return;
      const json = (await res.json()) as { ok: boolean; data?: Asset[] };
      if (json.ok && json.data) setAssets(json.data);
    });
  }, [open]);

  const onUpload = async (file: File) => {
    setError(null);
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const json = (await res.json()) as {
      ok: boolean;
      error?: string;
      data?: { url: string; id: string };
    };
    if (!json.ok || !json.data) {
      setError(json.error ?? "Upload failed");
      return;
    }
    setAssets((prev) => [
      { id: json.data!.id, url: json.data!.url, fileName: file.name },
      ...prev,
    ]);
    onChange(json.data.url);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative aspect-[16/10] w-full max-w-sm overflow-hidden rounded-[12px] border border-mist bg-mist">
          <Image src={value} alt="" fill className="object-cover" sizes="320px" />
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full max-w-sm items-center justify-center rounded-[12px] border border-dashed border-mist bg-mist/40 text-moss">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-mist px-3 text-sm text-bark hover:bg-mist/50">
            {label}
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto border-mist bg-paper text-bark sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Media library</DialogTitle>
            </DialogHeader>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-dashed border-mist px-4 py-6 text-sm text-moss hover:border-deodar hover:text-deodar">
              <Upload className="h-4 w-4" />
              Upload image (max 5MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
              />
            </label>
            {error && <p className="text-sm text-resin">{error}</p>}

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {pending && assets.length === 0 ? (
                <p className="col-span-full text-sm text-moss">Loading…</p>
              ) : assets.length === 0 ? (
                <p className="col-span-full text-sm text-moss">No images yet. Upload one.</p>
              ) : (
                assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onChange(asset.url);
                      setOpen(false);
                    }}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-[8px] border border-mist",
                      value === asset.url && "ring-2 ring-resin"
                    )}
                  >
                    <Image
                      src={asset.url}
                      alt={asset.fileName}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {value && (
          <button
            type="button"
            className="h-9 rounded-[8px] px-3 text-sm text-moss hover:text-resin"
            onClick={() => onChange(null)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
