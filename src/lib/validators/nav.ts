import { z } from "zod";

export const navItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  labelUr: z.string().optional().nullable(),
  href: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  target: z.enum(["SELF", "BLANK"]).default("SELF"),
  isVisible: z.coerce.boolean().default(true),
  isMegaMenu: z.coerce.boolean().default(false),
  isDynamicRegions: z.coerce.boolean().default(false),
  parentId: z.string().optional().nullable(),
  orderIndex: z.coerce.number().int().default(0),
});

export type NavItemInput = z.infer<typeof navItemSchema>;

export const reorderNavSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
  parentId: z.string().nullable().optional(),
});
