"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RequestStatus } from "@prisma/client";
import { updatePublicRequest } from "@/server/actions/contact";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  requestStatus: RequestStatus;
  officerNote: string | null;
};

export function RequestDetailForm({ id, requestStatus, officerNote }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(requestStatus);
  const [note, setNote] = useState(officerNote ?? "");
  const [pending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      const result = await updatePublicRequest(id, {
        requestStatus: status,
        officerNote: note.trim() || null,
      });
      if (result.ok) {
        toast.success("Saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4 rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]">
      <h2 className="font-sans text-sm font-semibold text-bark">Handle request</h2>

      <label className="block text-sm text-bark">
        Status
        <select
          className="mt-1 h-10 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as RequestStatus)}
        >
          {Object.values(RequestStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-bark">
        Officer note
        <span className="ml-2 font-normal text-moss">(visible on the public track page)</span>
        <textarea
          rows={5}
          className={cn(
            "mt-1 w-full rounded-[8px] border border-mist bg-paper px-3 py-2 text-sm text-bark outline-none focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
          )}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <button
        type="button"
        disabled={pending}
        onClick={onSave}
        className="h-10 rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
