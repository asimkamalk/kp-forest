"use client";

import Link from "next/link";
import { useTransition } from "react";
import { ArrowRight, Download } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { formatDisplayDate } from "@/lib/format-date";
import type { PublicDownload } from "@/lib/data/site";
import {
  DOWNLOAD_KIND_LABELS,
  downloadFileName,
  formatFileSize,
} from "@/lib/validators/download";
import { incrementDownloadCount } from "@/server/actions/download";

function toDateTimeAttr(value: Date | string | null) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type Props = {
  items: PublicDownload[];
};

export function LatestDownloads({ items }: Props) {
  const [, startTransition] = useTransition();

  return (
    <section
      aria-labelledby="latest-downloads-heading"
      className="bg-paper py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-resin">Downloads</p>
              <h2
                id="latest-downloads-heading"
                className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] text-bark"
              >
                Recent documents
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-moss">
                Publications, notifications, acts and forms issued by the department.
              </p>
            </div>
            <Link
              href="/downloads"
              className="group inline-flex items-center gap-2 text-sm font-medium text-deodar hover:text-bark"
            >
              View all downloads
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>

        {items.length === 0 ? (
          <p className="mt-10 text-sm text-moss">
            No documents published yet. New files appear here as they are issued.
          </p>
        ) : (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
            {items.map((item) => {
              const dateLabel = formatDisplayDate(item.documentDate);
              return (
                <StaggerItem key={item.id}>
                  <a
                    href={item.fileUrl}
                    download={downloadFileName(item.title, item.fileUrl)}
                    onClick={() => {
                      startTransition(() => {
                        void incrementDownloadCount(item.id);
                      });
                    }}
                    className="group flex h-full flex-col rounded-[12px] border border-mist bg-white p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
                        {DOWNLOAD_KIND_LABELS[item.kind] ?? item.kind}
                      </span>
                      <Download
                        className="h-4 w-4 shrink-0 text-deodar transition-colors group-hover:text-resin"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-3 font-sans text-base font-semibold text-bark group-hover:text-deodar">
                      {item.title}
                    </h3>
                    <p className="mt-auto pt-4 font-mono text-xs text-moss">
                      {dateLabel && (
                        <time dateTime={toDateTimeAttr(item.documentDate)}>
                          {dateLabel}
                        </time>
                      )}
                      {dateLabel && item.fileSize != null ? " · " : null}
                      {item.fileSize != null ? formatFileSize(item.fileSize) : null}
                    </p>
                  </a>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </section>
  );
}
