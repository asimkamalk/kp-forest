import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageForm } from "@/components/dashboard/pages/page-form";
import type { PageInput } from "@/lib/validators/admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditPagePage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  const defaults: PageInput = {
    slug: page.slug,
    title: page.title,
    titleUr: page.titleUr,
    summary: page.summary,
    body: page.body,
    bodyUr: page.bodyUr,
    coverImage: page.coverImage,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    orderIndex: page.orderIndex,
    status: page.status,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/pages" className="text-sm text-bark/60 hover:text-bark">
          ← Pages
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit page</h1>
        <p className="mt-1 text-sm text-moss">{page.slug}</p>
      </div>
      <PageForm mode="edit" pageId={page.id} defaults={defaults} />
    </div>
  );
}
