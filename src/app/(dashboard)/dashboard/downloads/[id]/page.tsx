import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DownloadForm } from "@/components/dashboard/downloads/download-form";
import { toDateInput, type DownloadInput } from "@/lib/validators/download";

type Props = { params: Promise<{ id: string }> };

export default async function EditDownloadPage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const download = await prisma.download.findUnique({ where: { id } });
  if (!download) notFound();

  const defaults: DownloadInput = {
    title: download.title,
    titleUr: download.titleUr,
    kind: download.kind,
    description: download.description,
    fileUrl: download.fileUrl,
    fileSize: download.fileSize,
    documentDate: toDateInput(download.documentDate) as unknown as Date | null,
    orderIndex: download.orderIndex,
    status: download.status,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/downloads" className="text-sm text-bark/60 hover:text-bark">
          ← Downloads
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit download</h1>
        <p className="mt-1 text-sm text-bark/60">{download.title}</p>
      </div>
      <DownloadForm mode="edit" downloadId={download.id} defaults={defaults} />
    </div>
  );
}
