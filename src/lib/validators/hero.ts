import { PublishStatus } from "@prisma/client";
import { z } from "zod";
import { publishStatusSchema } from "@/lib/validators/message";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleUr: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  subtitleUr: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Image is required"),
  imageAlt: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  secondaryCtaLabel: z.string().optional().nullable(),
  secondaryCtaHref: z.string().optional().nullable(),
  overlayOpacity: z.coerce.number().int().min(0).max(100).default(45),
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
  startsAt: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  endsAt: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
});

export type HeroSlideInput = z.infer<typeof heroSlideSchema>;

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

/** Format a Date for `<input type="date">` — safe to call from Server Components. */
export function toDateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
