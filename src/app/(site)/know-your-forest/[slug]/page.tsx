import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { PageBody } from "@/components/site/services/page-body";
import {
  getKnowYourForestBySlug,
  getPublishedKnowYourForestSlugs,
} from "@/lib/data/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedKnowYourForestSlugs();
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getKnowYourForestBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: `${article.title} | Know your forest`,
    description: article.summary ?? undefined,
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

export default async function KnowYourForestDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getKnowYourForestBySlug(slug);
  if (!article) notFound();

  return (
    <main className="flex-1 bg-paper py-12 md:py-20">
      <article className="mx-auto max-w-[800px] px-6">
        <Reveal>
          <nav aria-label="Breadcrumb" className="text-sm text-moss">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="transition-colors hover:text-deodar">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/know-your-forest"
                  className="transition-colors hover:text-deodar"
                >
                  Know your forest
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">{article.title}</li>
            </ol>
          </nav>
        </Reveal>

        <Reveal className="mt-8">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            {article.title}
          </h1>
          {article.summary && (
            <p className="mt-4 text-base leading-relaxed text-moss">{article.summary}</p>
          )}
        </Reveal>

        {article.coverImage && (
          <Reveal className="mt-8">
            <div
              className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-mist"
              style={{ boxShadow: "inset 0 0 0 1px var(--color-mist)" }}
            >
              <Image
                src={article.coverImage}
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
          <PageBody body={article.body} />
        </Reveal>

        <Reveal className="mt-12 border-t border-mist pt-8">
          <Link
            href="/wildlife"
            className="text-sm font-medium text-deodar underline-offset-4 hover:underline"
          >
            Browse wildlife species
          </Link>
        </Reveal>
      </article>
    </main>
  );
}
