import Link from "next/link";
import { MediaKind, PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { VideoPostForm } from "@/components/dashboard/media/video-post-form";
import type { MediaVideoInput } from "@/lib/validators/media";

const defaults: MediaVideoInput = {
  title: "",
  titleUr: "",
  slug: "",
  summary: "",
  coverImage: null,
  videoUrl: "",
  publishedAt: null,
  status: PublishStatus.DRAFT,
  kind: MediaKind.INTERVIEW,
};

export default async function NewVideoPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/media" className="text-sm text-bark/60 hover:text-bark">
          ← Media
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New video</h1>
      </div>
      <VideoPostForm mode="create" defaults={defaults} />
    </div>
  );
}
