import { cn } from "@/lib/utils";

export function Field({
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

export function inputClass(invalid: boolean) {
  return cn(
    "h-10 w-full rounded-[8px] border bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
    invalid ? "border-resin" : "border-mist"
  );
}

export function TicketSuccess({
  ticketNo,
  trackHref = "/contact/track",
}: {
  ticketNo: string;
  trackHref?: string;
}) {
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
        href={trackHref}
        className="mt-8 inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper hover:bg-bark"
      >
        Track this request
      </a>
    </div>
  );
}
