import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaKind, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VideoPostForm } from "@/components/dashboard/media/video-post-form";
import { toDateInput, type MediaVideoInput } from "@/lib/validators/media";

type Props = { params: Promise<{ id: string }> };

export default async function EditVideoPage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const post = await prisma.mediaPost.findUnique({ where: { id } });
  if (!post || !post.videoUrl) notFound();

  const defaults: MediaVideoInput = {
    title: post.title,
    titleUr: post.titleUr,
    slug: post.slug,
    summary: post.summary,
    coverImage: post.coverImage,
    videoUrl: post.videoUrl,
    publishedAt: toDateInput(post.publishedAt) as unknown as Date | null,
    status: post.status,
    kind: MediaKind.INTERVIEW,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/media" className="text-sm text-bark/60 hover:text-bark">
          ← Media
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit video</h1>
      </div>
      <VideoPostForm mode="edit" postId={post.id} defaults={defaults} />
    </div>
  );
}
