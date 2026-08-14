"use client";

import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { statCounterSchema, type StatCounterInput } from "@/lib/validators/stat";
import { createStatCounter, updateStatCounter } from "@/server/actions/stat";
import type { ActionResult } from "@/server/actions/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  statId?: string;
  defaults: StatCounterInput;
};

export function StatForm({ mode, statId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<StatCounterInput>[] = [
    { name: "label", label: "Label", tab: "en" },
    { name: "labelUr", label: "Label (Urdu)", tab: "ur" },
    {
      name: "value",
      label: "Value",
      tab: "all",
      description: "The number on the homepage band. Decimals are allowed (e.g. 1.2).",
      render: ({ value, onChange, error }) => (
        <input
          type="number"
          step="any"
          className={cn(
            "h-10 w-full rounded-[8px] border bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
            error ? "border-resin" : "border-mist"
          )}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      ),
    },
    {
      name: "prefix",
      label: "Prefix",
      tab: "all",
      placeholder: "PKR ",
      description: "Shown before the number.",
    },
    {
      name: "suffix",
      label: "Suffix",
      tab: "all",
      placeholder: "B+",
      description: "Shown after the number (e.g. B+, %, ha).",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
      tab: "all",
    },
    { name: "orderIndex", label: "Order", type: "number", tab: "all" },
  ];

  return (
    <ResourceForm
      schema={statCounterSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      submitLabel={mode === "create" ? "Create statistic" : "Save statistic"}
      preview={(values) => (
        <div className="rounded-[12px] bg-bark px-6 py-10 text-center">
          <p className="font-mono text-[32px] leading-none text-paper">
            {values.prefix ?? ""}
            {typeof values.value === "number" && Number.isFinite(values.value)
              ? values.value.toLocaleString("en-GB")
              : "0"}
            {values.suffix ?? ""}
          </p>
          <p className="mt-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-moss">
            {values.label || "Label"}
          </p>
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createStatCounter(values)
            : await updateStatCounter(statId!, values);
        if (result.ok) {
          router.push("/dashboard/stats");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
