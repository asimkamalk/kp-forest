import { z } from "zod";
import { digitsOnly } from "@/lib/sanitise";

/** Official districts of Khyber Pakhtunkhwa (incl. merged tribal districts). */
export const KP_DISTRICTS = [
  "Abbottabad",
  "Bajaur",
  "Bannu",
  "Battagram",
  "Buner",
  "Charsadda",
  "Chitral Lower",
  "Chitral Upper",
  "Dera Ismail Khan",
  "Hangu",
  "Haripur",
  "Karak",
  "Khyber",
  "Kohat",
  "Kohistan Lower",
  "Kohistan Upper",
  "Kolai Palas",
  "Kurram",
  "Lakki Marwat",
  "Lower Dir",
  "Malakand",
  "Mansehra",
  "Mardan",
  "Mohmand",
  "North Waziristan",
  "Nowshera",
  "Orakzai",
  "Peshawar",
  "Shangla",
  "South Waziristan",
  "Swabi",
  "Swat",
  "Tank",
  "Torghar",
  "Upper Dir",
] as const;

export type KpDistrict = (typeof KP_DISTRICTS)[number];

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const publicRequestSubjectSchema = z.enum(["Complaint", "Suggestion"]);
export type PublicRequestSubject = z.infer<typeof publicRequestSubjectSchema>;

export const citizenRequestSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name is required")
      .max(120, "Full name must be 120 characters or fewer"),
    cnic: z.preprocess(
      emptyToNull,
      z
        .union([z.string(), z.null()])
        .optional()
        .transform((v) => {
          if (v == null || v === "") return null;
          return digitsOnly(v);
        })
        .refine(
          (v) => v == null || /^\d{13}$/.test(v),
          "This CNIC must be 13 digits"
        )
    ),
    phone: z
      .string()
      .min(1, "Phone is required")
      .transform((v) => v.replace(/[\s-]/g, ""))
      .refine(
        (v) => /^(?:\+92|0)?3\d{9}$/.test(v),
        "Enter a Pakistani mobile number, for example 03XXXXXXXXX"
      ),
    email: z.preprocess(
      emptyToNull,
      z
        .union([
          z.string().email("Enter a valid email address").max(160),
          z.null(),
        ])
        .optional()
    ),
    district: z.enum(KP_DISTRICTS, { message: "Select a district" }),
    address: z.preprocess(
      emptyToNull,
      z
        .union([
          z.string().max(400, "Address must be 400 characters or fewer"),
          z.null(),
        ])
        .optional()
    ),
    purpose: z
      .string()
      .min(20, "Write at least 20 characters")
      .max(2000, "Keep this between 20 and 2000 characters"),
    attachmentUrl: z.preprocess(emptyToNull, z.union([z.string(), z.null()]).optional()),
    subject: publicRequestSubjectSchema,
    /** Honeypot — must stay empty. */
    website: z.string().optional().default(""),
    /** Epoch ms when the form was shown. */
    formStartedAt: z.coerce.number().int().positive("Invalid form session"),
  })
  .superRefine((data, ctx) => {
    if (data.website && data.website.length > 0) {
      ctx.addIssue({ code: "custom", message: "Rejected", path: ["website"] });
    }
    const url = data.attachmentUrl;
    if (url && typeof url === "string" && url.length > 0) {
      const ok = url.startsWith("/uploads/") || /^https?:\/\//i.test(url);
      if (!ok) {
        ctx.addIssue({
          code: "custom",
          message: "Attachment URL is invalid",
          path: ["attachmentUrl"],
        });
      }
    }
  });

export type CitizenRequestInput = z.infer<typeof citizenRequestSchema>;

export const trackTicketSchema = z.object({
  ticketNo: z
    .string()
    .min(1, "Enter a ticket number")
    .transform((v) => v.trim().toUpperCase())
    .refine(
      (v) => /^KPFD-\d{4}-\d{5}$/.test(v),
      "Ticket numbers look like KPFD-2026-00001"
    ),
  website: z.string().optional().default(""),
});

export type TrackTicketInput = z.infer<typeof trackTicketSchema>;

export const updateRequestStatusSchema = z.object({
  requestStatus: z.enum(["NEW", "IN_REVIEW", "APPROVED", "REJECTED", "FULFILLED"]),
  officerNote: z.preprocess(
    emptyToNull,
    z.union([z.string().max(4000), z.null()]).optional()
  ),
});

export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
