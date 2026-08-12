"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Download } from "lucide-react";
import type { DownloadKind } from "@prisma/client";
import { Reveal } from "@/components/motion/reveal";
import {
  DOWNLOAD_KIND_LABELS,
  downloadFileName,
  formatFileSize,
} from "@/lib/validators/download";
import { incrementDownloadCount } from "@/server/actions/download";
import type { PublicDownload } from "@/lib/data/site";

type YearGroup = {
  year: string;
  items: PublicDownload[];
};

function groupByYear(items: PublicDownload[]): YearGroup[] {
  const map = new Map<string, PublicDownload[]>();
  for (const item of items) {
    const year = item.documentDate
      ? String(new Date(item.documentDate).getFullYear())
      : "Undated";
    const list = map.get(year) ?? [];
    list.push(item);
    map.set(year, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return Number(b) - Number(a);
    })
    .map(([year, yearItems]) => ({ year, items: yearItems }));
}

type Props = {
  items: PublicDownload[];
  emptyMessage: string;
  searchPlaceholder?: string;
};

export function DownloadsList({
  items,
  emptyMessage,
  searchPlaceholder = "Search by title…",
}: Props) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.title.toLowerCase().includes(q));
  }, [items, deferredQuery]);

  const groups = useMemo(() => groupByYear(filtered), [filtered]);

  const onDownload = (item: PublicDownload) => {
    startTransition(() => {
      void incrementDownloadCount(item.id);
    });
  };

  if (items.length === 0) {
    return <p className="mt-10 text-sm text-moss">{emptyMessage}</p>;
  }

  return (
    <div className="mt-8 space-y-10">
      <label className="block max-w-md">
        <span className="sr-only">Search downloads</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-moss">No documents match “{deferredQuery.trim()}”.</p>
      ) : (
        groups.map((group) => (
          <Reveal key={group.year}>
            <section>
              <h2 className="font-mono text-lg font-medium text-resin">{group.year}</h2>
              <ul className="mt-4 divide-y divide-mist border-y border-mist">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans text-base font-medium text-bark">
                          {item.title}
                        </h3>
                        <span className="inline-flex rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
                          {DOWNLOAD_KIND_LABELS[item.kind as DownloadKind]}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-moss">
                        {formatFileSize(item.fileSize)}
                        {item.documentDate
                          ? ` · ${new Date(item.documentDate).toLocaleDateString()}`
                          : null}
                      </p>
                    </div>
                    <a
                      href={item.fileUrl}
                      download={downloadFileName(item.title, item.fileUrl)}
                      onClick={() => onDownload(item)}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper transition-colors hover:bg-bark"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))
      )}
    </div>
  );
}
