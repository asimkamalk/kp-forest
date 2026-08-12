import { PublishStatus } from "@prisma/client";
import { z } from "zod";

export const publishStatusSchema = z.enum([
  PublishStatus.DRAFT,
  PublishStatus.REVIEW,
  PublishStatus.PUBLISHED,
  PublishStatus.ARCHIVED,
]);

export const messageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  kind: z.enum([
    "MINISTER",
    "ADVISOR",
    "CHIEF_MINISTER",
    "SECRETARY_CLIMATE_CHANGE",
    "SECRETARY",
    "CHIEF_CONSERVATOR",
    "CONSERVATOR",
    "DFO",
    "OTHER",
  ]),
  personName: z.string().min(1, "Name is required"),
  personNameUr: z.string().optional().nullable(),
  designation: z.string().min(1, "Designation is required"),
  designationUr: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  excerptUr: z.string().optional().nullable(),
  body: z.string().min(1, "Message body is required"),
  bodyUr: z.string().optional().nullable(),
  signatureUrl: z.string().optional().nullable(),
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
});

export type MessageInput = z.infer<typeof messageSchema>;

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
