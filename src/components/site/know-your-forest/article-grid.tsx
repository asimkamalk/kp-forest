import Link from "next/link";
import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import type { KnowYourForestCard } from "@/lib/data/site";

type Props = {
  articles: KnowYourForestCard[];
};

export function KnowYourForestGrid({ articles }: Props) {
  if (articles.length === 0) {
    return (
      <p className="mt-10 text-sm text-moss">
        No articles published yet. New guides appear here as they are issued.
      </p>
    );
  }

  return (
    <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
      {articles.map((article) => (
        <StaggerItem key={article.id}>
          <Link
            href={`/know-your-forest/${article.slug}`}
            className="group block overflow-hidden rounded-[12px] border border-mist bg-white shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div
              className="relative aspect-[4/3] bg-mist"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
            >
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
              ) : null}
            </div>
            <div className="space-y-2 p-4">
              <h2 className="font-display text-xl text-bark group-hover:text-deodar">
                {article.title}
              </h2>
              {article.summary && (
                <p className="line-clamp-3 text-sm leading-relaxed text-moss">
                  {article.summary}
                </p>
              )}
            </div>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
