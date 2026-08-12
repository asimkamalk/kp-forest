import { z } from "zod";
import { digitsOnly } from "@/lib/sanitise";
import { KP_DISTRICTS } from "@/lib/validators/contact";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const NURSERY_SPECIES = [
  "Chir pine",
  "Deodar",
  "Poplar",
  "Eucalyptus",
  "Shisham",
  "Walnut",
  "Mulberry",
  "Robinia",
] as const;

export type NurserySpecies = (typeof NURSERY_SPECIES)[number];

const cnicField = z.preprocess(
  emptyToNull,
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v == null || v === "") return null;
      return digitsOnly(v);
    })
    .refine((v) => v == null || /^\d{13}$/.test(v), "This CNIC must be 13 digits")
);

const phoneField = z
  .string()
  .min(1, "Phone is required")
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine(
    (v) => /^(?:\+92|0)?3\d{9}$/.test(v),
    "Enter a Pakistani mobile number, for example 03XXXXXXXXX"
  );

const emailField = z.preprocess(
  emptyToNull,
  z
    .union([z.string().email("Enter a valid email address").max(160), z.null()])
    .optional()
);

const honeypotFields = {
  /** Honeypot — must stay empty. */
  website: z.string().optional().default(""),
  /** Epoch ms when the form was shown. */
  formStartedAt: z.coerce.number().int().positive("Invalid form session"),
};

function rejectHoneypot(
  data: { website?: string },
  ctx: z.RefinementCtx
) {
  if (data.website && data.website.length > 0) {
    ctx.addIssue({ code: "custom", message: "Rejected", path: ["website"] });
  }
}

export const plantRequestSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name is required")
      .max(120, "Full name must be 120 characters or fewer"),
    cnic: cnicField,
    phone: phoneField,
    email: emailField,
    district: z.enum(KP_DISTRICTS, { message: "Select a district" }),
    address: z
      .string()
      .min(5, "Address is required")
      .max(400, "Address must be 400 characters or fewer"),
    species: z
      .array(z.enum(NURSERY_SPECIES))
      .min(1, "Select at least one species")
      .max(NURSERY_SPECIES.length),
    quantity: z.coerce
      .number()
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1")
      .max(5000, "Quantity cannot exceed 5000"),
    purpose: z
      .string()
      .min(20, "Write at least 20 characters")
      .max(1000, "Keep this between 20 and 1000 characters"),
    ...honeypotFields,
  })
  .superRefine(rejectHoneypot);

export type PlantRequestInput = z.infer<typeof plantRequestSchema>;

export const researchRequestSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name is required")
      .max(120, "Full name must be 120 characters or fewer"),
    cnic: cnicField,
    phone: phoneField,
    email: emailField,
    institution: z
      .string()
      .min(2, "Institution is required")
      .max(200, "Institution must be 200 characters or fewer"),
    topic: z
      .string()
      .min(5, "Topic is required")
      .max(300, "Topic must be 300 characters or fewer"),
    purpose: z
      .string()
      .min(50, "Write at least 50 characters")
      .max(2000, "Keep this between 50 and 2000 characters"),
    attachmentUrl: z
      .string()
      .min(1, "Attach a PDF proposal document")
      .refine(
        (url) => url.startsWith("/uploads/") || /^https?:\/\//i.test(url),
        "Attachment URL is invalid"
      )
      .refine(
        (url) => /\.pdf($|\?)/i.test(url),
        "Proposal document must be a PDF"
      ),
    ...honeypotFields,
  })
  .superRefine(rejectHoneypot);

export type ResearchRequestInput = z.infer<typeof researchRequestSchema>;

export const WILDLIFE_CATEGORIES = ["Mammal", "Bird", "Reptile"] as const;
export type WildlifeCategory = (typeof WILDLIFE_CATEGORIES)[number];
