import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaKind } from "@prisma/client";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getLatestMedia } from "@/lib/data/site";

const KIND_LABEL: Record<string, string> = {
  [MediaKind.PRESS_RELEASE]: "Press release",
  [MediaKind.NEWS_COVERAGE]: "News",
};

function formatDate(value: Date | string | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDateTimeAttr(value: Date | string | null) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export async function LatestNews() {
  const posts = await getLatestMedia();
  const [featured, ...rest] = posts;

  return (
    <section
      aria-labelledby="latest-news-heading"
      className="bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-resin">Media Centre</p>
              <h2
                id="latest-news-heading"
                className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] text-bark"
              >
                Latest from the department
              </h2>
            </div>
            <Link
              href="/media/press-releases"
              className="group inline-flex items-center gap-2 text-sm font-medium text-deodar hover:text-bark"
            >
              View all
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </Reveal>

        {posts.length === 0 ? (
          <p className="mt-10 text-sm text-moss">
            No press releases yet. New releases appear here as they are issued.
          </p>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
            {featured && (
              <Reveal className="lg:col-span-2">
                <Link
                  href={`/media/${featured.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-mist bg-paper shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div
                    className="relative aspect-[16/9] w-full bg-mist"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
                  >
                    {featured.coverImage ? (
                      <Image
                        src={featured.coverImage}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {formatDate(featured.publishedAt) && (
                        <time
                          dateTime={toDateTimeAttr(featured.publishedAt)}
                          className="font-mono text-xs text-moss"
                        >
                          {formatDate(featured.publishedAt)}
                        </time>
                      )}
                      <span className="rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
                        {KIND_LABEL[featured.kind] ?? featured.kind}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[clamp(1.35rem,2vw,1.75rem)] text-bark">
                      {featured.title}
                    </h3>
                    {featured.summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-moss">
                        {featured.summary}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            )}

            <Stagger className="flex flex-col divide-y divide-mist border-y border-mist" gap={0.08}>
              {rest.map((post) => (
                <StaggerItem key={post.id}>
                  <Link
                    href={`/media/${post.slug}`}
                    className="group block py-4 transition-colors hover:bg-paper/80"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {formatDate(post.publishedAt) && (
                        <time
                          dateTime={toDateTimeAttr(post.publishedAt)}
                          className="font-mono text-xs text-moss"
                        >
                          {formatDate(post.publishedAt)}
                        </time>
                      )}
                      <span className="rounded-[8px] bg-mist px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-bark">
                        {KIND_LABEL[post.kind] ?? post.kind}
                      </span>
                    </div>
                    <p className="mt-2 font-sans text-sm font-medium text-bark group-hover:text-deodar">
                      {post.title}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </div>
    </section>
  );
}
