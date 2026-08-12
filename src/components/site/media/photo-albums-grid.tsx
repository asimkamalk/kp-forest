"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { PublicAlbumCard } from "@/lib/data/site";
import { cn } from "@/lib/utils";

type Props = {
  albums: PublicAlbumCard[];
};

export function PhotoAlbumsGrid({ albums }: Props) {
  const [regionId, setRegionId] = useState("all");

  const regions = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of albums) {
      if (a.regionId && a.regionName) map.set(a.regionId, a.regionName);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [albums]);

  const filtered = useMemo(
    () =>
      regionId === "all"
        ? albums
        : albums.filter((a) => a.regionId === regionId),
    [albums, regionId]
  );

  if (albums.length === 0) {
    return (
      <p className="mt-10 text-sm text-moss">
        No photo albums published yet. Division galleries appear here when
        ready.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {regions.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by region">
          <Chip active={regionId === "all"} onClick={() => setRegionId("all")}>
            All regions
          </Chip>
          {regions.map((r) => (
            <Chip
              key={r.id}
              active={regionId === r.id}
              onClick={() => setRegionId(r.id)}
            >
              {r.name}
            </Chip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-moss">No albums in this region.</p>
      ) : (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {filtered.map((album) => (
            <StaggerItem key={album.id}>
              <Link
                href={`/media/photos/${album.slug}`}
                className="group block overflow-hidden rounded-[12px] border border-mist bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative aspect-[4/3] bg-mist">
                  {album.coverImage ? (
                    <Image
                      src={album.coverImage}
                      alt={album.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="font-display text-xl text-bark group-hover:text-deodar">
                    {album.title}
                  </h2>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-moss">
                    {album.imageCount}{" "}
                    {album.imageCount === 1 ? "image" : "images"}
                    {album.divisionName ? ` · ${album.divisionName}` : ""}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-[8px] border px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-colors",
        active
          ? "border-deodar bg-deodar text-paper"
          : "border-mist bg-paper text-moss hover:border-deodar hover:text-bark"
      )}
    >
      {children}
    </button>
  );
}
