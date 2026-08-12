import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { divisionWhere, galleryAlbumWhere } from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import { GalleryAlbumForm } from "@/components/dashboard/media/gallery-album-form";
import { GalleryImagesEditor } from "@/components/dashboard/media/gallery-images-editor";
import type { GalleryAlbumInput } from "@/lib/validators/media";

type Props = { params: Promise<{ id: string }> };

export default async function EditAlbumPage({ params }: Props) {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const [album, divisions] = await Promise.all([
    prisma.galleryAlbum.findFirst({
      where: { id, ...galleryAlbumWhere(session) },
      include: {
        images: {
          orderBy: { orderIndex: "asc" },
          include: { asset: { select: { url: true } } },
        },
      },
    }),
    prisma.division.findMany({
      where: divisionWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!album) notFound();

  const defaults: GalleryAlbumInput = {
    slug: album.slug,
    title: album.title,
    titleUr: album.titleUr,
    description: album.description,
    coverImage: album.coverImage,
    divisionId: album.divisionId ?? "",
    orderIndex: album.orderIndex,
    status: album.status,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <div>
        <Link href="/dashboard/media" className="text-sm text-bark/60 hover:text-bark">
          ← Media
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit photo album</h1>
      </div>
      <GalleryAlbumForm
        mode="edit"
        albumId={album.id}
        defaults={defaults}
        divisions={divisions}
      />
      <GalleryImagesEditor
        albumId={album.id}
        images={album.images.map((img) => ({
          id: img.id,
          url: img.asset.url,
          caption: img.caption,
          captionUr: img.captionUr,
          orderIndex: img.orderIndex,
        }))}
      />
    </div>
  );
}
