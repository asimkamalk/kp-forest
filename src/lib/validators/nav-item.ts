import { z } from "zod";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const navItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  labelUr: z.string().optional().nullable(),
  href: z.preprocess(emptyToNull, z.string().nullable().optional()),
  icon: z.preprocess(emptyToNull, z.string().nullable().optional()),
  target: z.enum(["SELF", "BLANK"]).default("SELF"),
  orderIndex: z.coerce.number().int().default(0),
  isVisible: z.coerce.boolean().default(true),
  isMegaMenu: z.coerce.boolean().default(false),
  isDynamicRegions: z.coerce.boolean().default(false),
  parentId: z.preprocess(emptyToNull, z.string().nullable().optional()),
});

export type NavItemInput = z.infer<typeof navItemSchema>;

export const reorderNavItemsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
  /** null = top-level reorder; string = children within that parent */
  parentId: z.string().nullable().optional(),
});
