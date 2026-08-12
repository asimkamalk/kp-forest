import { DownloadKind, PublishStatus } from "@prisma/client";
import { z } from "zod";
import { publishStatusSchema } from "@/lib/validators/message";
import { toDateInput } from "@/lib/validators/hero";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const downloadKindSchema = z.enum([
  DownloadKind.ACT,
  DownloadKind.RULE,
  DownloadKind.POLICY,
  DownloadKind.FORM,
  DownloadKind.REPORT,
  DownloadKind.NOTIFICATION,
]);

export const downloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleUr: z.string().optional().nullable(),
  kind: downloadKindSchema,
  description: z.string().optional().nullable(),
  fileUrl: z.string().min(1, "File is required"),
  fileSize: z.coerce.number().int().nonnegative().nullable().optional(),
  documentDate: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
});

export type DownloadInput = z.infer<typeof downloadSchema>;

export { toDateInput };

export const DOWNLOAD_KIND_LABELS: Record<DownloadKind, string> = {
  ACT: "Act",
  RULE: "Rule",
  POLICY: "Policy",
  FORM: "Form",
  REPORT: "Report",
  NOTIFICATION: "Notification",
};

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return "—";
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

/** Filename for the browser Save As dialog — title + extension from the stored URL. */
export function downloadFileName(title: string, fileUrl: string): string {
  const base = title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120)
    .trim() || "download";
  const extMatch = fileUrl.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch?.[1]?.toLowerCase() ?? "";
  if (!ext) return base;
  if (base.toLowerCase().endsWith(`.${ext}`)) return base;
  return `${base}.${ext}`;
}
