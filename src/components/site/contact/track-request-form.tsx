"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RequestStatus } from "@prisma/client";
import { trackTicketSchema, type TrackTicketInput } from "@/lib/validators/contact";
import { trackCitizenRequest } from "@/server/actions/contact";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<RequestStatus, string> = {
  NEW: "Received",
  IN_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FULFILLED: "Fulfilled",
};

export function TrackRequestForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ticketNo: string;
    requestStatus: RequestStatus;
    officerNote: string | null;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackTicketInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(trackTicketSchema as any),
    defaultValues: { ticketNo: "", website: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await trackCitizenRequest(values);
      if (res.ok) setResult(res.data);
      else setError(res.error);
    });
  });

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
        >
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-bark">
            Ticket number
          </label>
          <input
            className={cn(
              "h-11 w-full max-w-md rounded-[8px] border bg-paper px-3 font-mono text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
              errors.ticketNo ? "border-resin" : "border-mist"
            )}
            placeholder="KPFD-2026-00001"
            autoComplete="off"
            spellCheck={false}
            {...register("ticketNo")}
          />
          {errors.ticketNo?.message && (
            <p className="mt-1.5 text-sm text-resin" role="alert">
              {errors.ticketNo.message}
            </p>
          )}
        </div>

        {error && (
          <p
            className="rounded-[8px] border border-resin/40 bg-resin/10 px-3 py-2 text-sm text-bark"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60 hover:bg-bark"
        >
          {pending ? "Looking up…" : "Check status"}
        </button>
      </form>

      {result && (
        <div
          className="rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]"
          aria-live="polite"
        >
          <p className="font-mono text-xs uppercase tracking-wider text-moss">Ticket</p>
          <p className="mt-1 font-mono text-lg text-bark">{result.ticketNo}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-moss">Status</p>
          <p className="mt-1 font-sans text-base font-medium text-deodar">
            {STATUS_LABEL[result.requestStatus]}
          </p>
          {result.officerNote ? (
            <>
              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-moss">
                Officer note
              </p>
              <p className="mt-1 text-sm leading-relaxed text-bark">{result.officerNote}</p>
            </>
          ) : (
            <p className="mt-4 text-sm text-moss">No public note has been posted yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
