import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import {
  AlbumMasonryWithLightbox,
  type AlbumLightboxImage,
} from "@/components/site/media/album-lightbox";
import {
  getAlbumBySlug,
  getPublishedAlbumSlugs,
} from "@/lib/data/site";

type Props = { params: Promise<{ album: string }> };

export async function generateStaticParams() {
  const rows = await getPublishedAlbumSlugs();
  return rows.map((row) => ({ album: row.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { album: slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album not found" };
  return {
    title: `${album.title} | Photo gallery`,
    description: album.description ?? undefined,
    openGraph: {
      title: album.title,
      description: album.description ?? undefined,
      images: album.coverImage ? [{ url: album.coverImage }] : undefined,
    },
  };
}

export default async function AlbumDetailPage({ params }: Props) {
  const { album: slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  const images: AlbumLightboxImage[] = album.images.map((img) => ({
    id: img.id,
    url: img.asset.url,
    alt: img.asset.alt ?? img.caption ?? album.title,
    caption: img.caption,
  }));

  const divisionLabel = album.division
    ? `${album.division.name}${
        album.division.circle?.region
          ? ` · ${album.division.circle.region.name}`
          : ""
      }`
    : null;

  return (
    <article className="py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
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
                  href="/media/photos"
                  className="transition-colors hover:text-deodar"
                >
                  Photos
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-bark">{album.title}</li>
            </ol>
          </nav>
        </Reveal>

        <Reveal className="mt-8">
          <p className="eyebrow text-resin">Photo album</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] text-bark">
            {album.title}
          </h1>
          {divisionLabel && (
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-moss">
              {divisionLabel}
            </p>
          )}
          {album.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-moss">
              {album.description}
            </p>
          )}
        </Reveal>

        {images.length === 0 ? (
          <p className="mt-10 text-sm text-moss">This album has no images yet.</p>
        ) : (
          <AlbumMasonryWithLightbox images={images} />
        )}
      </div>
    </article>
  );
}
