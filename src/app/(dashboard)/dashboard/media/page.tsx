import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { galleryAlbumWhere } from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import {
  MediaTablesClient,
  type AlbumRow,
  type MediaPostRow,
} from "@/components/dashboard/media/media-tables-client";

export default async function MediaDashboardPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const [posts, albums] = await Promise.all([
    prisma.mediaPost.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        kind: true,
        publishedAt: true,
        status: true,
        videoUrl: true,
      },
    }),
    prisma.galleryAlbum.findMany({
      where: galleryAlbumWhere(session),
      orderBy: [{ orderIndex: "asc" }, { title: "asc" }],
      include: {
        division: { select: { name: true } },
        _count: { select: { images: true } },
      },
    }),
  ]);

  const postRows: MediaPostRow[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    kind: p.kind,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    status: p.status,
    hasVideo: Boolean(p.videoUrl),
  }));

  const albumRows: AlbumRow[] = albums.map((a) => ({
    id: a.id,
    title: a.title,
    divisionName: a.division?.name ?? null,
    imageCount: a._count.images,
    status: a.status,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <p className="eyebrow text-resin">Media</p>
        <h1 className="mt-1 font-display text-2xl text-bark">Media Gallery</h1>
      </div>
      <MediaTablesClient posts={postRows} albums={albumRows} />
    </div>
  );
}
