import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { PageForm } from "@/components/dashboard/pages/page-form";
import type { PageInput } from "@/lib/validators/admin";

const defaults: PageInput = {
  slug: "",
  title: "",
  titleUr: null,
  summary: null,
  body: "",
  bodyUr: null,
  coverImage: null,
  seoTitle: null,
  seoDescription: null,
  orderIndex: 0,
  status: PublishStatus.DRAFT,
};

export default async function NewPagePage() {
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
        <Link href="/dashboard/pages" className="text-sm text-bark/60 hover:text-bark">
          ← Pages
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New page</h1>
      </div>
      <PageForm mode="create" defaults={defaults} />
    </div>
  );
}
