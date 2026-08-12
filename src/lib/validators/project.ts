import { ProjectStatus, PublishStatus } from "@prisma/client";
import { z } from "zod";
import { publishStatusSchema } from "@/lib/validators/message";
import { toDateInput } from "@/lib/validators/hero";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const projectStatusSchema = z.enum([
  ProjectStatus.COMPLETED,
  ProjectStatus.ONGOING,
  ProjectStatus.FUTURE,
]);

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  title: z.string().min(1, "Title is required"),
  titleUr: z.string().optional().nullable(),
  projectStatus: projectStatusSchema,
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  costPkr: z.preprocess(
    emptyToNull,
    z.coerce.number().nonnegative("Cost must be zero or more").nullable().optional()
  ),
  fundingSource: z.string().optional().nullable(),
  startDate: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  endDate: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  progressPct: z.coerce.number().int().min(0).max(100).default(0),
  coverImage: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
  regionId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  circleId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  divisionId: z.preprocess(emptyToNull, z.string().nullable().optional()),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export { toDateInput };

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  COMPLETED: "Completed",
  ONGOING: "Ongoing",
  FUTURE: "Future",
};

export function formatPkr(value: number | null | undefined): string {
  if (value == null) return "—";
  return `PKR ${value.toLocaleString("en-PK")}`;
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): string {
  const fmt = (v: Date | string | null | undefined) => {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const a = fmt(start);
  const b = fmt(end);
  if (!a && !b) return "—";
  if (a && b) return `${a} – ${b}`;
  return a ?? b ?? "—";
}
