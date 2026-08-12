import Link from "next/link";
import { MediaKind, PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { NewsCoverageForm } from "@/components/dashboard/media/news-coverage-form";
import type { NewsCoverageInput } from "@/lib/validators/media";

const defaults: NewsCoverageInput = {
  title: "",
  titleUr: "",
  slug: "",
  summary: "",
  body: "",
  coverImage: null,
  documentUrl: null,
  publishedAt: null,
  status: PublishStatus.DRAFT,
  kind: MediaKind.NEWS_COVERAGE,
  sourceName: "",
  sourceUrl: "",
};

export default async function NewNewsPage() {
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
        <h1 className="mt-2 font-display text-2xl text-bark">New news coverage</h1>
      </div>
      <NewsCoverageForm mode="create" defaults={defaults} />
    </div>
  );
}
