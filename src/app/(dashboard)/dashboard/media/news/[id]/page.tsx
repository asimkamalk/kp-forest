import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaKind, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewsCoverageForm } from "@/components/dashboard/media/news-coverage-form";
import { toDateInput, type NewsCoverageInput } from "@/lib/validators/media";

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const post = await prisma.mediaPost.findUnique({ where: { id } });
  if (!post || post.kind !== MediaKind.NEWS_COVERAGE) notFound();

  const defaults: NewsCoverageInput = {
    title: post.title,
    titleUr: post.titleUr,
    slug: post.slug,
    summary: post.summary,
    body: post.body,
    coverImage: post.coverImage,
    documentUrl: post.documentUrl,
    publishedAt: toDateInput(post.publishedAt) as unknown as Date | null,
    status: post.status,
    kind: MediaKind.NEWS_COVERAGE,
    sourceName: post.sourceName ?? "",
    sourceUrl: post.sourceUrl ?? "",
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/media" className="text-sm text-bark/60 hover:text-bark">
          ← Media
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit news coverage</h1>
      </div>
      <NewsCoverageForm mode="edit" postId={post.id} defaults={defaults} />
    </div>
  );
}
