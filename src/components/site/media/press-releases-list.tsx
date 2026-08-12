import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { PressReleaseListItem } from "@/lib/data/site";
import {
  formatMediaDate,
  toDateTimeAttr,
} from "@/lib/validators/media";

type Props = {
  items: PressReleaseListItem[];
  page: number;
  totalPages: number;
};

export function PressReleasesList({ items, page, totalPages }: Props) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-sm text-moss">
        No press releases published yet. New releases appear here when they go
        live.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-10">
      <Stagger className="divide-y divide-mist border-y border-mist" gap={0.06}>
        {items.map((item) => {
          const dateLabel = formatMediaDate(item.publishedAt);
          return (
            <StaggerItem key={item.id}>
              <article className="flex flex-col gap-3 py-8 sm:flex-row sm:items-start sm:gap-10">
                {dateLabel && (
                  <time
                    dateTime={toDateTimeAttr(item.publishedAt)}
                    className="shrink-0 font-mono text-xs uppercase tracking-wider text-moss"
                  >
                    {dateLabel}
                  </time>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[clamp(1.35rem,2.5vw,1.75rem)] leading-tight text-bark">
                    <Link
                      href={`/media/press-releases/${item.slug}`}
                      className="transition-colors hover:text-deodar"
                    >
                      {item.title}
                    </Link>
                  </h2>
                  {item.summary && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-moss">
                      {item.summary}
                    </p>
                  )}
                  <Link
                    href={`/media/press-releases/${item.slug}`}
                    className="mt-4 inline-flex text-sm font-medium text-deodar underline-offset-4 hover:underline"
                  >
                    Read the release
                  </Link>
                </div>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>

      {totalPages > 1 && (
        <nav
          aria-label="Press releases pagination"
          className="flex items-center justify-between gap-4"
        >
          {page > 1 ? (
            <Link
              href={`/media/press-releases?page=${page - 1}`}
              className="rounded-[8px] border border-mist px-3 py-2 text-sm text-bark hover:bg-mist/40"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <p className="font-mono text-xs text-moss">
            Page {page} of {totalPages}
          </p>
          {page < totalPages ? (
            <Link
              href={`/media/press-releases?page=${page + 1}`}
              className="rounded-[8px] border border-mist px-3 py-2 text-sm text-bark hover:bg-mist/40"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
