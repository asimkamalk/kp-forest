import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PageBody } from "@/components/site/services/page-body";
import type { PublicPage } from "@/lib/data/site";

type Crumb = { href?: string; label: string };

type Props = {
  page: PublicPage;
  crumbs: Crumb[];
  eyebrow?: string;
  children?: ReactNode;
};

export function AboutProseLayout({
  page,
  crumbs,
  eyebrow = "About",
  children,
}: Props) {
  return (
    <main className="flex-1 bg-paper py-12 md:py-20">
      <article className="mx-auto max-w-[800px] px-6">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              {crumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden>/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-deodar"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-bark">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        <Reveal className="mt-8">
          <p className="eyebrow text-resin">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            {page.title}
          </h1>
          {page.summary && (
            <p className="mt-4 text-base leading-relaxed text-moss">{page.summary}</p>
          )}
        </Reveal>

        {page.coverImage && (
          <Reveal className="mt-8">
            <div
              className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-mist"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
            >
              <Image
                src={page.coverImage}
                alt=""
                fill
                priority
                sizes="800px"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        <Reveal className="mt-10">
          <PageBody
            body={page.body}
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-bark prose-p:font-sans prose-p:leading-relaxed prose-p:text-bark/90 prose-a:text-deodar prose-strong:text-bark"
          />
        </Reveal>

        {children}
      </article>
    </main>
  );
}
