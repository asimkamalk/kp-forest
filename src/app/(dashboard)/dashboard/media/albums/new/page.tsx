import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { divisionWhere } from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import { GalleryAlbumForm } from "@/components/dashboard/media/gallery-album-form";
import type { GalleryAlbumInput } from "@/lib/validators/media";

const defaults: GalleryAlbumInput = {
  slug: "",
  title: "",
  titleUr: "",
  description: "",
  coverImage: null,
  divisionId: "",
  orderIndex: 0,
  status: PublishStatus.PUBLISHED,
};

export default async function NewAlbumPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const divisions = await prisma.division.findMany({
    where: divisionWhere(session),
    orderBy: { orderIndex: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/media" className="text-sm text-bark/60 hover:text-bark">
          ← Media
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New photo album</h1>
      </div>
      <GalleryAlbumForm mode="create" defaults={defaults} divisions={divisions} />
    </div>
  );
}
