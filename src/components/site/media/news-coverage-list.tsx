import { ExternalLink } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { PublicNewsCard } from "@/lib/data/site";
import {
  formatMediaDate,
  toDateTimeAttr,
} from "@/lib/validators/media";

type Props = {
  items: PublicNewsCard[];
};

export function NewsCoverageList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-sm text-moss">
        No news coverage listed yet. External coverage appears here when
        published.
      </p>
    );
  }

  return (
    <Stagger className="mt-10 grid gap-6 sm:grid-cols-2" gap={0.08}>
      {items.map((item) => {
        const dateLabel = formatMediaDate(item.publishedAt);
        const href = item.sourceUrl;
        return (
          <StaggerItem key={item.id}>
            <article className="flex h-full flex-col rounded-[12px] border border-mist bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-moss">
                {item.sourceName && <span>{item.sourceName}</span>}
                {dateLabel && (
                  <time dateTime={toDateTimeAttr(item.publishedAt)}>
                    {dateLabel}
                  </time>
                )}
              </div>
              <h2 className="mt-3 font-display text-xl text-bark">{item.title}</h2>
              {item.summary && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-moss">
                  {item.summary}
                </p>
              )}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-deodar underline-offset-4 hover:underline"
                >
                  Read at source
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </article>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
