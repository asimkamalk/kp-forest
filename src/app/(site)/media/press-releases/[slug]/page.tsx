import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import {
  getPressReleaseBySlug,
  getPublishedPressReleaseSlugs,
} from "@/lib/data/site";
import {
  formatMediaDate,
  toDateTimeAttr,
} from "@/lib/validators/media";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedPressReleaseSlugs();
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPressReleaseBySlug(slug);
  if (!post) return { title: "Press release not found" };
  return {
    title: `${post.title} | Press releases`,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function PressReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPressReleaseBySlug(slug);
  if (!post) notFound();

  const dateLabel = formatMediaDate(post.publishedAt);
  const paragraphs = (post.body ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="py-12 md:py-20">
      <div className="mx-auto max-w-[800px] px-6">
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
                  href="/media/press-releases"
                  className="transition-colors hover:text-deodar"
                >
                  Press releases
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">{post.title}</li>
            </ol>
          </nav>
        </Reveal>

        <Reveal className="mt-8">
          {dateLabel && (
            <time
              dateTime={toDateTimeAttr(post.publishedAt)}
              className="font-mono text-xs uppercase tracking-wider text-moss"
            >
              {dateLabel}
            </time>
          )}
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            {post.title}
          </h1>
          {post.summary && (
            <p className="mt-4 text-base leading-relaxed text-moss">{post.summary}</p>
          )}
        </Reveal>

        {post.coverImage && (
          <Reveal className="mt-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-mist">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                sizes="800px"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        {paragraphs.length > 0 && (
          <Reveal className="prose prose-neutral mt-10 max-w-none text-bark prose-p:leading-relaxed prose-headings:font-display">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
        )}

        {post.documentUrl && (
          <Reveal className="mt-10">
            <a
              href={post.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
            >
              <FileText className="h-4 w-4" aria-hidden />
              Download document
            </a>
          </Reveal>
        )}
      </div>
    </article>
  );
}
