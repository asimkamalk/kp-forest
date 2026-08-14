import { PublishStatus } from "@prisma/client";
import { z } from "zod";
import { publishStatusSchema } from "@/lib/validators/message";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const statCounterSchema = z.object({
  label: z.string().min(1, "Label is required"),
  labelUr: z.preprocess(emptyToNull, z.string().nullable().optional()),
  value: z.coerce.number().refine((n) => Number.isFinite(n), "Enter a number"),
  prefix: z.preprocess(emptyToNull, z.string().nullable().optional()),
  suffix: z.preprocess(emptyToNull, z.string().nullable().optional()),
  icon: z.preprocess(emptyToNull, z.string().nullable().optional()),
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
});

export type StatCounterInput = z.infer<typeof statCounterSchema>;

export const reorderStatsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});
