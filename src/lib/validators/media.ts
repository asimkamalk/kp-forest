import { MediaKind, PublishStatus } from "@prisma/client";
import { z } from "zod";
import { formatDisplayDate } from "@/lib/format-date";
import { publishStatusSchema } from "@/lib/validators/message";
import { toDateInput } from "@/lib/validators/hero";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

const slugField = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const basePostFields = {
  title: z.string().min(1, "Title is required"),
  titleUr: z.string().optional().nullable(),
  slug: slugField,
  summary: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  publishedAt: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
};

export const pressReleaseSchema = z.object({
  ...basePostFields,
  kind: z.literal(MediaKind.PRESS_RELEASE).default(MediaKind.PRESS_RELEASE),
});

export const newsCoverageSchema = z.object({
  ...basePostFields,
  kind: z.literal(MediaKind.NEWS_COVERAGE).default(MediaKind.NEWS_COVERAGE),
  sourceName: z.string().min(1, "Source name is required"),
  sourceUrl: z
    .string()
    .min(1, "Source URL is required")
    .url("Enter a valid URL"),
});

const youtubeOrVimeo = z
  .string()
  .min(1, "Video URL is required")
  .refine(
    (url) =>
      /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url) ||
      /vimeo\.com/i.test(url),
    "Video URL must be a YouTube or Vimeo link"
  );

export const videoPostSchema = z.object({
  ...basePostFields,
  kind: z.literal(MediaKind.INTERVIEW).default(MediaKind.INTERVIEW),
  videoUrl: youtubeOrVimeo,
});

/** Videos tab uses INTERVIEW kind for video embeds, or we could use a dedicated approach.
 * Spec says videoUrl on MediaPost — kind for videos page: filter by videoUrl not null,
 * or use INTERVIEW. Seed used INTERVIEW for interview. For dashboard Videos tab,
 * we'll use posts with videoUrl set. Schema for video form: */
export const mediaVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleUr: z.string().optional().nullable(),
  slug: slugField,
  summary: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  videoUrl: youtubeOrVimeo,
  publishedAt: z.preprocess(emptyToNull, z.coerce.date().nullable().optional()),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
  kind: z.literal(MediaKind.INTERVIEW).default(MediaKind.INTERVIEW),
});

export const galleryAlbumSchema = z.object({
  slug: slugField,
  title: z.string().min(1, "Title is required"),
  titleUr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  divisionId: z.string().min(1, "Division is required"),
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.PUBLISHED),
});

export const galleryImageCaptionSchema = z.object({
  caption: z.string().optional().nullable(),
  captionUr: z.string().optional().nullable(),
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
  parentId: z.string().nullable().optional(),
});

export const addGalleryImagesSchema = z.object({
  albumId: z.string().min(1),
  assetIds: z.array(z.string().min(1)).min(1),
});

export type PressReleaseInput = z.infer<typeof pressReleaseSchema>;
export type NewsCoverageInput = z.infer<typeof newsCoverageSchema>;
export type MediaVideoInput = z.infer<typeof mediaVideoSchema>;
export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;

export { toDateInput };

export function formatMediaDate(value: Date | string | null | undefined): string | null {
  return formatDisplayDate(value);
}

export function toDateTimeAttr(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/** Parse YouTube / Vimeo into a privacy-friendly embed URL. */
export function toEmbedUrl(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/embed/")[1]?.split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
