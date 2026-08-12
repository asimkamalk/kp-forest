import Link from "next/link";
import { MediaKind, PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { PressReleaseForm } from "@/components/dashboard/media/press-release-form";
import type { PressReleaseInput } from "@/lib/validators/media";

const defaults: PressReleaseInput = {
  title: "",
  titleUr: "",
  slug: "",
  summary: "",
  body: "",
  coverImage: null,
  documentUrl: null,
  publishedAt: null,
  status: PublishStatus.DRAFT,
  kind: MediaKind.PRESS_RELEASE,
};

export default async function NewPressReleasePage() {
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
        <h1 className="mt-2 font-display text-2xl text-bark">New press release</h1>
      </div>
      <PressReleaseForm mode="create" defaults={defaults} />
    </div>
  );
}
