import Link from "next/link";
import { DownloadKind, PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { DownloadForm } from "@/components/dashboard/downloads/download-form";
import type { DownloadInput } from "@/lib/validators/download";

const defaults: DownloadInput = {
  title: "",
  titleUr: "",
  kind: DownloadKind.REPORT,
  description: "",
  fileUrl: "",
  fileSize: null,
  documentDate: null,
  orderIndex: 0,
  status: PublishStatus.DRAFT,
};

export default async function NewDownloadPage() {
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
        <Link href="/dashboard/downloads" className="text-sm text-bark/60 hover:text-bark">
          ← Downloads
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New download</h1>
      </div>
      <DownloadForm mode="create" defaults={defaults} />
    </div>
  );
}
