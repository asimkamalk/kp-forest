import { Role, PublishStatus } from "@prisma/client";
import { z } from "zod";
import { publishStatusSchema } from "@/lib/validators/message";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const roleSchema = z.enum([
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
  Role.EDITOR,
  Role.VIEWER,
]);

export const ROLE_OPTIONS = [
  { label: "Super admin", value: Role.SUPER_ADMIN },
  { label: "Region admin", value: Role.REGION_ADMIN },
  { label: "Circle admin", value: Role.CIRCLE_ADMIN },
  { label: "Division admin", value: Role.DIVISION_ADMIN },
  { label: "Editor", value: Role.EDITOR },
  { label: "Viewer", value: Role.VIEWER },
] as const;

const scopeFields = {
  regionId: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  circleId: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  divisionId: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
};

export const createUserSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(120),
    email: z.string().email("Enter a valid email").max(160),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128, "Password must be 128 characters or fewer"),
    role: roleSchema,
    designation: z.preprocess(emptyToNull, z.union([z.string().max(160), z.null()]).optional()),
    phone: z.preprocess(emptyToNull, z.union([z.string().max(40), z.null()]).optional()),
    avatarUrl: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
    isActive: z.boolean().default(true),
    ...scopeFields,
  })
  .superRefine((data, ctx) => {
    if (data.role === Role.REGION_ADMIN && !data.regionId) {
      ctx.addIssue({ code: "custom", message: "Select a region", path: ["regionId"] });
    }
    if (data.role === Role.CIRCLE_ADMIN && !data.circleId) {
      ctx.addIssue({ code: "custom", message: "Select a circle", path: ["circleId"] });
    }
    if (data.role === Role.DIVISION_ADMIN && !data.divisionId) {
      ctx.addIssue({ code: "custom", message: "Select a division", path: ["divisionId"] });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(120),
    email: z.string().email("Enter a valid email").max(160),
    role: roleSchema,
    designation: z.preprocess(emptyToNull, z.union([z.string().max(160), z.null()]).optional()),
    phone: z.preprocess(emptyToNull, z.union([z.string().max(40), z.null()]).optional()),
    avatarUrl: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
    isActive: z.boolean().default(true),
    ...scopeFields,
  })
  .superRefine((data, ctx) => {
    if (data.role === Role.REGION_ADMIN && !data.regionId) {
      ctx.addIssue({ code: "custom", message: "Select a region", path: ["regionId"] });
    }
    if (data.role === Role.CIRCLE_ADMIN && !data.circleId) {
      ctx.addIssue({ code: "custom", message: "Select a circle", path: ["circleId"] });
    }
    if (data.role === Role.DIVISION_ADMIN && !data.divisionId) {
      ctx.addIssue({ code: "custom", message: "Select a division", path: ["divisionId"] });
    }
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128, "Password must be 128 characters or fewer"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const siteSettingSchema = z.object({
  siteName: z.string().min(2, "Site name is required").max(200),
  siteNameUr: z.preprocess(emptyToNull, z.union([z.string().max(200), z.null()]).optional()),
  tagline: z.preprocess(emptyToNull, z.union([z.string().max(400), z.null()]).optional()),
  taglineUr: z.preprocess(emptyToNull, z.union([z.string().max(400), z.null()]).optional()),
  logoUrl: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  faviconUrl: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  emblemUrl: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  address: z.preprocess(emptyToNull, z.union([z.string().max(500), z.null()]).optional()),
  phone: z.preprocess(emptyToNull, z.union([z.string().max(40), z.null()]).optional()),
  email: z.preprocess(
    emptyToNull,
    z.union([z.string().email("Enter a valid email").max(160), z.null()]).optional()
  ),
  helplineNumber: z.preprocess(emptyToNull, z.union([z.string().max(40), z.null()]).optional()),
  footerNote: z.preprocess(emptyToNull, z.union([z.string().max(500), z.null()]).optional()),
  googleAnalytics: z.preprocess(emptyToNull, z.union([z.string().max(40), z.null()]).optional()),
  maintenanceMode: z.boolean().default(false),
});

export type SiteSettingInput = z.infer<typeof siteSettingSchema>;

export const pageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  title: z.string().min(1, "Title is required").max(200),
  titleUr: z.preprocess(emptyToNull, z.union([z.string().max(200), z.null()]).optional()),
  summary: z.preprocess(emptyToNull, z.union([z.string().max(600), z.null()]).optional()),
  body: z.string().min(1, "Body is required"),
  bodyUr: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  coverImage: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
  seoTitle: z.preprocess(emptyToNull, z.union([z.string().max(120), z.null()]).optional()),
  seoDescription: z.preprocess(emptyToNull, z.union([z.string().max(300), z.null()]).optional()),
  orderIndex: z.coerce.number().int().default(0),
  status: publishStatusSchema.default(PublishStatus.DRAFT),
});

export type PageInput = z.infer<typeof pageSchema>;

export const auditFilterSchema = z.object({
  action: z.string().optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type AuditFilterInput = z.infer<typeof auditFilterSchema>;
