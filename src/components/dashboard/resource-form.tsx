"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  Controller,
  type DefaultValues,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import slugify from "slugify";
import { toast } from "sonner";
import type { ActionResult } from "@/server/actions/types";
import { cn } from "@/lib/utils";

export type FieldDescriptor<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "url"
    | "email"
    | "date"
    | "datetime"
    | "select"
    | "checkbox"
    | "slider"
    | "image"
    | "json";
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  tab?: "en" | "ur" | "all";
  min?: number;
  max?: number;
  rows?: number;
  render?: (args: {
    value: unknown;
    onChange: (value: unknown) => void;
    error?: string;
  }) => ReactNode;
};

type Props<T extends FieldValues> = {
  schema: z.ZodType<T>;
  fields: FieldDescriptor<T>[];
  defaultValues: DefaultValues<T>;
  onSubmit: (values: T) => Promise<ActionResult>;
  submitLabel?: string;
  preview?: (values: T) => ReactNode;
  showLanguageTabs?: boolean;
  onCancel?: () => void;
  /** When true, keeps `slug` in sync with `name` until the user edits the slug. */
  autoSlug?: boolean;
};

export function ResourceForm<T extends FieldValues>({
  schema,
  fields,
  defaultValues,
  onSubmit,
  submitLabel = "Save",
  preview,
  showLanguageTabs = false,
  onCancel,
  autoSlug = false,
}: Props<T>) {
  const router = useRouter();
  const [tab, setTab] = useState<"en" | "ur">("en");
  const [pending, startTransition] = useTransition();
  const slugTouched = useRef(
    Boolean(
      defaultValues &&
        "slug" in defaultValues &&
        typeof (defaultValues as { slug?: unknown }).slug === "string" &&
        String((defaultValues as { slug?: string }).slug).length > 0
    )
  );
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = form;

  const values = watch();
  const nameValue = watch("name" as Path<T>);

  useEffect(() => {
    if (!autoSlug || slugTouched.current) return;
    if (typeof nameValue !== "string") return;
    const next = slugify(nameValue, { lower: true, strict: true });
    setValue("slug" as Path<T>, next as never, { shouldDirty: false });
  }, [autoSlug, nameValue, setValue]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const visibleFields = useMemo(() => {
    if (!showLanguageTabs) return fields;
    return fields.filter((f) => !f.tab || f.tab === "all" || f.tab === tab);
  }, [fields, showLanguageTabs, tab]);

  const submit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.ok) {
        toast.success("Saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  });

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        {showLanguageTabs && (
          <div className="flex gap-2 border-b border-mist pb-2">
            {(["en", "ur"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-[8px] px-3 py-1.5 text-sm font-medium",
                  tab === key ? "bg-deodar text-paper" : "text-moss hover:text-bark"
                )}
              >
                {key === "en" ? "English" : "اردو"}
              </button>
            ))}
          </div>
        )}

        {visibleFields.map((field) => {
          const error = errors[field.name]?.message as string | undefined;
          return (
            <div key={String(field.name)}>
              <label className="mb-1.5 block text-sm font-medium text-bark">
                {field.label}
              </label>
              {field.description && (
                <p className="mb-1.5 text-xs text-moss">{field.description}</p>
              )}

              {field.render ? (
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: rhf }) => (
                    <>
                      {field.render?.({
                        value: rhf.value,
                        onChange: rhf.onChange,
                        error,
                      })}
                    </>
                  )}
                />
              ) : field.type === "textarea" || field.type === "json" ? (
                <textarea
                  rows={field.rows ?? 4}
                  className={inputClass(!!error)}
                  placeholder={field.placeholder}
                  {...register(field.name)}
                />
              ) : field.type === "select" ? (
                <select className={inputClass(!!error)} {...register(field.name)}>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-bark">
                  <input type="checkbox" className="accent-deodar" {...register(field.name)} />
                  {field.placeholder ?? "Enabled"}
                </label>
              ) : field.type === "slider" ? (
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: rhf }) => (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        value={Number(rhf.value ?? 0)}
                        onChange={(e) => rhf.onChange(Number(e.target.value))}
                        className="w-full accent-deodar"
                      />
                      <span className="data w-10 text-sm text-bark">{Number(rhf.value ?? 0)}</span>
                    </div>
                  )}
                />
              ) : (
                <input
                  type={
                    field.type === "datetime"
                      ? "datetime-local"
                      : field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : field.type === "email"
                            ? "email"
                            : field.type === "url"
                              ? "url"
                              : "text"
                  }
                  className={inputClass(!!error)}
                  placeholder={field.placeholder}
                  {...register(field.name, {
                    onChange: (e) => {
                      if (autoSlug && String(field.name) === "slug") {
                        slugTouched.current = true;
                      }
                      return e;
                    },
                  })}
                />
              )}

              {error && (
                <p className="mt-1.5 text-sm text-resin" role="alert">
                  {error}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="h-10 rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60"
          >
            {isSubmitting || pending ? "Saving…" : submitLabel}
          </button>
          <button
            type="button"
            className="h-10 rounded-[8px] border border-mist px-5 text-sm text-bark"
            onClick={() => (onCancel ? onCancel() : router.back())}
          >
            Cancel
          </button>
        </div>
      </div>

      {preview && (
        <aside className="h-fit rounded-[12px] border border-mist bg-paper p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-20">
          <p className="eyebrow mb-3 text-resin">Live preview</p>
          {preview(values as T)}
        </aside>
      )}
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "h-10 w-full rounded-[8px] border bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
    invalid ? "border-resin" : "border-mist"
  );
}
