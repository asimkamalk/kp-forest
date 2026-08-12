"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, X } from "lucide-react";
import {
  researchRequestSchema,
  type ResearchRequestInput,
} from "@/lib/validators/services";
import { submitResearchRequest } from "@/server/actions/services";
import { Field, TicketSuccess, inputClass } from "@/components/site/services/form-shared";
import { cn } from "@/lib/utils";

export function ResearchRequestForm() {
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
  } = useForm<ResearchRequestInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(researchRequestSchema as any),
    defaultValues: {
      fullName: "",
      cnic: null,
      phone: "",
      email: null,
      institution: "",
      topic: "",
      purpose: "",
      attachmentUrl: "",
      website: "",
      formStartedAt: startedAt,
    },
  });

  useEffect(() => {
    setValue("formStartedAt", startedAt);
  }, [setValue, startedAt]);

  const attachmentUrl = watch("attachmentUrl");

  const onUpload = async (file: File) => {
    setFormError(null);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFormError("Proposal document must be a PDF");
      return;
    }
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
      if (!/\.pdf$/i.test(json.data.url)) {
        setFormError("Proposal document must be a PDF");
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
      const result = await submitResearchRequest({
        ...values,
        formStartedAt: startedAt,
      });
      if (result.ok) {
        setTicketNo(result.data.ticketNo);
      } else {
        setFormError(result.error);
      }
    });
  });

  if (ticketNo) {
    return <TicketSuccess ticketNo={ticketNo} />;
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <input type="hidden" {...register("formStartedAt", { valueAsNumber: true })} />
      <input type="hidden" {...register("attachmentUrl")} />

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

      <Field label="Institution" error={errors.institution?.message} required>
        <input
          className={inputClass(!!errors.institution)}
          placeholder="University or research organisation"
          {...register("institution")}
        />
      </Field>

      <Field label="Research topic" error={errors.topic?.message} required>
        <input className={inputClass(!!errors.topic)} {...register("topic")} />
      </Field>

      <Field label="Purpose" error={errors.purpose?.message} required>
        <textarea
          rows={6}
          className={cn(inputClass(!!errors.purpose), "h-auto py-2.5")}
          placeholder="Describe the study aims, methods and data or access you need"
          {...register("purpose")}
        />
      </Field>

      <div>
        <p className="mb-1.5 text-sm font-medium text-bark">
          Proposal document <span className="text-resin">*</span>
        </p>
        <p className="mb-2 text-xs text-moss">PDF only · max 5MB</p>
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
              onClick={() => setValue("attachmentUrl", "", { shouldValidate: true })}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-mist px-3 text-sm text-bark hover:bg-mist/40">
            <Upload className="h-4 w-4" aria-hidden />
            {uploading ? "Uploading…" : "Attach PDF"}
            <input
              type="file"
              accept="application/pdf,.pdf"
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
        <p
          className="rounded-[8px] border border-resin/40 bg-resin/10 px-3 py-2 text-sm text-bark"
          role="alert"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60 hover:bg-bark"
      >
        {pending ? "Submitting…" : "Submit research request"}
      </button>
    </form>
  );
}
