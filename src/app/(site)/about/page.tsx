import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { PageBody } from "@/components/site/services/page-body";
import { getPageBySlug, getStatCounters } from "@/lib/data/site";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about");
  if (!page) return { title: "About" };
  return {
    title: page.seoTitle ?? `${page.title} | About`,
    description: page.seoDescription ?? page.summary ?? undefined,
    openGraph: {
      title: page.title,
      description: page.summary ?? undefined,
      images: page.coverImage ? [{ url: page.coverImage }] : undefined,
    },
  };
}

const SUBPAGES = [
  {
    slug: "vision-mission",
    href: "/about/vision-mission",
    fallbackTitle: "Vision & mission",
  },
  {
    slug: null as string | null,
    href: "/about/organogram",
    fallbackTitle: "Organogram",
    fallbackSummary: "Secretary, Chief Conservator, regions, circles and divisions.",
  },
  {
    slug: "functions-mandate",
    href: "/about/mandate",
    fallbackTitle: "Functions & mandate",
  },
] as const;

export default async function AboutPage() {
  const page = await getPageBySlug("about");
  if (!page) notFound();

  const [counters, vision, mandate] = await Promise.all([
    getStatCounters(),
    getPageBySlug("vision-mission"),
    getPageBySlug("functions-mandate"),
  ]);

  const cards = SUBPAGES.map((item) => {
    if (item.href === "/about/vision-mission") {
      return {
        href: item.href,
        title: vision?.title ?? item.fallbackTitle,
        summary: vision?.summary ?? null,
      };
    }
    if (item.href === "/about/mandate") {
      return {
        href: item.href,
        title: mandate?.title ?? item.fallbackTitle,
        summary: mandate?.summary ?? null,
      };
    }
    return {
      href: item.href,
      title: item.fallbackTitle,
      summary: "fallbackSummary" in item ? item.fallbackSummary : null,
    };
  });

  return (
    <main className="flex-1 bg-paper">
      <article className="mx-auto max-w-[1200px] px-6 py-12 md:py-20">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="transition-colors hover:text-deodar">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">{page.title}</li>
            </ol>
          </nav>
          <p className="eyebrow mt-8 text-resin">About</p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,6vw,4.5rem)] tracking-[-0.02em] leading-[1.02] text-bark">
            {page.title}
          </h1>
          {page.summary && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-moss">
              {page.summary}
            </p>
          )}
        </Reveal>

        {page.coverImage && (
          <Reveal className="mt-10">
            <div
              className="relative aspect-[21/9] w-full overflow-hidden rounded-[12px] bg-mist"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
            >
              <Image
                src={page.coverImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        <Reveal className="mx-auto mt-10 max-w-[800px]">
          <PageBody
            body={page.body}
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-bark prose-p:font-sans prose-p:leading-relaxed prose-p:text-bark/90 prose-a:text-deodar"
          />
        </Reveal>
      </article>

      {counters.length > 0 && (
        <section aria-label="Key figures" className="border-y border-mist bg-white">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 md:grid-cols-4">
            {counters.slice(0, 4).map((stat, i) => (
              <div
                key={stat.id}
                className={`px-6 py-10 md:py-12 ${
                  i % 2 === 1 ? "border-l border-mist" : ""
                } ${i >= 2 ? "border-t border-mist md:border-t-0" : ""} ${
                  i > 0 ? "md:border-l md:border-mist" : ""
                }`}
              >
                <p className="text-[32px] leading-none text-bark">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix ?? ""}
                    suffix={stat.suffix ?? ""}
                    className="text-[32px] text-bark"
                  />
                </p>
                <p className="mt-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-moss">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        <Reveal>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] text-bark">
            Explore further
          </h2>
        </Reveal>
        <Stagger className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6" gap={0.08}>
          {cards.map((card) => (
            <StaggerItem key={card.href}>
              <Link
                href={card.href}
                className="group flex h-full flex-col rounded-[12px] border border-mist bg-white p-5 shadow-[var(--shadow-card)] transition-[transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-deodar md:p-6"
              >
                <span className="font-sans text-base font-semibold text-bark group-hover:text-deodar">
                  {card.title}
                </span>
                {card.summary && (
                  <span className="mt-2 text-sm leading-relaxed text-moss">
                    {card.summary}
                  </span>
                )}
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-deodar">
                  Open
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </main>
  );
}
