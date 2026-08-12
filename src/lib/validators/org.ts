import { PublishStatus } from "@prisma/client";
import { z } from "zod";
import { publishStatusSchema } from "@/lib/validators/message";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

const optionalFloat = z.preprocess(emptyToNull, z.coerce.number().nullable().optional());

export const orgBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameUr: z.string().optional().nullable(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  headquarters: z.string().optional().nullable(),
  shortDesc: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionUr: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  officerName: z.string().optional().nullable(),
  officerDesignation: z.string().optional().nullable(),
  officerPhoto: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  centerLat: optionalFloat,
  centerLng: optionalFloat,
  areaHectares: optionalFloat,
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.PUBLISHED),
  /** Pasted GeoJSON string; parsed to JSON in the server action. */
  mapGeoJson: z.string().optional().nullable(),
});

export const regionSchema = orgBaseSchema.extend({
  code: z.string().min(1, "Code is required"),
  headquarters: z.string().min(1, "Headquarters is required"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export const circleSchema = orgBaseSchema.extend({
  regionId: z.string().min(1, "Region is required"),
});

export const divisionSchema = orgBaseSchema.extend({
  circleId: z.string().min(1, "Circle is required"),
  forestType: z.string().optional().nullable(),
});

export type RegionInput = z.infer<typeof regionSchema>;
export type CircleInput = z.infer<typeof circleSchema>;
export type DivisionInput = z.infer<typeof divisionSchema>;

export function parseMapGeoJson(
  value: string | null | undefined
): { ok: true; data: object | null } | { ok: false; error: string } {
  if (!value || value.trim() === "") return { ok: true, data: null };
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || typeof parsed !== "object") {
      return { ok: false, error: "mapGeoJson must be a JSON object or FeatureCollection" };
    }
    return { ok: true, data: parsed as object };
  } catch {
    return { ok: false, error: "mapGeoJson must be valid JSON" };
  }
}

export function stringifyMapGeoJson(value: unknown): string {
  if (value == null) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}
