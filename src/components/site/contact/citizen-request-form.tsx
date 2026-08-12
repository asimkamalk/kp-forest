"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, X } from "lucide-react";
import {
  citizenRequestSchema,
  KP_DISTRICTS,
  type CitizenRequestInput,
  type PublicRequestSubject,
} from "@/lib/validators/contact";
import { submitCitizenRequest } from "@/server/actions/contact";
import { cn } from "@/lib/utils";

type Props = {
  subject: PublicRequestSubject;
};

export function CitizenRequestForm({ subject }: Props) {
  const [ticketNo, setTicketNo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CitizenRequestInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(citizenRequestSchema as any),
    defaultValues: {
      fullName: "",
      cnic: null,
      phone: "",
      email: null,
      district: undefined,
      address: null,
      purpose: "",
      attachmentUrl: null,
      subject,
      website: "",
      formStartedAt: startedAt,
    },
  });

  useEffect(() => {
    setValue("formStartedAt", startedAt);
    setValue("subject", subject);
  }, [setValue, startedAt, subject]);

  const attachmentUrl = watch("attachmentUrl");

  const onUpload = async (file: File) => {
    setFormError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/contact/attachment", { method: "POST", body });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { url: string };
      };
      if (!json.ok || !json.data) {
        setFormError(json.error ?? "Upload failed");
        return;
      }
      setValue("attachmentUrl", json.data.url, { shouldValidate: true });
    } catch {
      setFormError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await submitCitizenRequest({
        ...values,
        formStartedAt: startedAt,
        subject,
      });
      if (result.ok) {
        setTicketNo(result.data.ticketNo);
      } else {
        setFormError(result.error);
      }
    });
  });

  if (ticketNo) {
    return (
      <div className="rounded-[12px] border border-mist bg-paper p-6 shadow-[var(--shadow-card)] md:p-8">
        <p className="eyebrow text-resin">Submitted</p>
        <h2 className="mt-3 font-display text-2xl text-bark md:text-3xl">
          Keep this ticket number
        </h2>
        <p
          className="mt-6 font-mono text-2xl font-medium tracking-wide text-deodar md:text-3xl"
          aria-live="polite"
        >
          {ticketNo}
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-moss">
          Write it down or take a screenshot. Use it on the track page to check status.
          We do not email a copy automatically.
        </p>
        <a
          href="/contact/track"
          className="mt-8 inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
        >
          Track this request
        </a>
      </div>
    );
  }

  const purposeLabel =
    subject === "Complaint" ? "Your complaint" : "Your suggestion";

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      {/* Honeypot: hidden from sighted users and assistive tech */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </label>
      </div>

      <input type="hidden" {...register("formStartedAt", { valueAsNumber: true })} />
      <input type="hidden" {...register("subject")} />

      <Field label="Full name" error={errors.fullName?.message} required>
        <input
          className={inputClass(!!errors.fullName)}
          autoComplete="name"
          {...register("fullName")}
        />
      </Field>

      <Field label="CNIC" error={errors.cnic?.message} hint="13 digits, optional">
        <input
          className={inputClass(!!errors.cnic)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="xxxxx-xxxxxxx-x"
          {...register("cnic")}
        />
      </Field>

      <Field label="Mobile phone" error={errors.phone?.message} required>
        <input
          className={inputClass(!!errors.phone)}
          type="tel"
          autoComplete="tel"
          placeholder="03XXXXXXXXX"
          {...register("phone")}
        />
      </Field>

      <Field label="Email" error={errors.email?.message} hint="Optional">
        <input
          className={inputClass(!!errors.email)}
          type="email"
          autoComplete="email"
          {...register("email")}
        />
      </Field>

      <Field label="District" error={errors.district?.message} required>
        <select className={inputClass(!!errors.district)} {...register("district")}>
          <option value="">Select district</option>
          {KP_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Address" error={errors.address?.message} hint="Optional">
        <input className={inputClass(!!errors.address)} {...register("address")} />
      </Field>

      <Field label={purposeLabel} error={errors.purpose?.message} required>
        <textarea
          rows={6}
          className={cn(inputClass(!!errors.purpose), "h-auto py-2.5")}
          {...register("purpose")}
        />
      </Field>

      <div>
        <p className="mb-1.5 text-sm font-medium text-bark">Attachment</p>
        <p className="mb-2 text-xs text-moss">Optional · JPEG, PNG, WebP, GIF or PDF · max 5MB</p>
        {attachmentUrl ? (
          <div className="flex items-center gap-3 rounded-[8px] border border-mist px-3 py-2">
            <FileText className="h-4 w-4 text-deodar" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-bark">
              {attachmentUrl}
            </span>
            <button
              type="button"
              className="rounded-[8px] p-1 text-moss hover:text-resin"
              aria-label="Remove attachment"
              onClick={() => setValue("attachmentUrl", null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-mist px-3 text-sm text-bark hover:bg-mist/40">
            <Upload className="h-4 w-4" aria-hidden />
            {uploading ? "Uploading…" : "Attach file"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {errors.attachmentUrl?.message && (
          <p className="mt-1.5 text-sm text-resin" role="alert">
            {errors.attachmentUrl.message}
          </p>
        )}
      </div>

      {formError && (
        <p className="rounded-[8px] border border-resin/40 bg-resin/10 px-3 py-2 text-sm text-bark" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60 hover:bg-bark"
      >
        {pending
          ? "Submitting…"
          : subject === "Complaint"
            ? "Lodge complaint"
            : "Submit suggestion"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-bark">
        {label}
        {required && <span className="text-resin"> *</span>}
        {hint && !required && (
          <span className="ml-2 font-normal text-moss">({hint})</span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-resin" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "h-10 w-full rounded-[8px] border bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
    invalid ? "border-resin" : "border-mist"
  );
}
