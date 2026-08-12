"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KP_DISTRICTS } from "@/lib/validators/contact";
import {
  NURSERY_SPECIES,
  plantRequestSchema,
  type NurserySpecies,
  type PlantRequestInput,
} from "@/lib/validators/services";
import { submitPlantRequest } from "@/server/actions/services";
import { Field, TicketSuccess, inputClass } from "@/components/site/services/form-shared";
import { cn } from "@/lib/utils";

export function PlantRequestForm() {
  const [ticketNo, setTicketNo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlantRequestInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(plantRequestSchema as any),
    defaultValues: {
      fullName: "",
      cnic: null,
      phone: "",
      email: null,
      district: undefined,
      address: "",
      species: [],
      quantity: 1,
      purpose: "",
      website: "",
      formStartedAt: startedAt,
    },
  });

  useEffect(() => {
    setValue("formStartedAt", startedAt);
  }, [setValue, startedAt]);

  const selected = watch("species") ?? [];

  const toggleSpecies = (name: NurserySpecies) => {
    const next = selected.includes(name)
      ? selected.filter((s) => s !== name)
      : [...selected, name];
    setValue("species", next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await submitPlantRequest({
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

      <Field label="Address" error={errors.address?.message} required>
        <input
          className={inputClass(!!errors.address)}
          autoComplete="street-address"
          {...register("address")}
        />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-bark">
          Species <span className="text-resin">*</span>
        </legend>
        <p className="mb-3 text-xs text-moss">Select all that apply from common nursery stock.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {NURSERY_SPECIES.map((name) => {
            const checked = selected.includes(name);
            return (
              <label
                key={name}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-[8px] border px-3 py-2 text-sm text-bark",
                  checked ? "border-deodar bg-deodar/5" : "border-mist hover:bg-mist/30"
                )}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-mist text-deodar focus-visible:ring-resin"
                  checked={checked}
                  onChange={() => toggleSpecies(name)}
                />
                {name}
              </label>
            );
          })}
        </div>
        {errors.species?.message && (
          <p className="mt-1.5 text-sm text-resin" role="alert">
            {errors.species.message}
          </p>
        )}
      </fieldset>

      <Field label="Quantity" error={errors.quantity?.message} required>
        <input
          className={inputClass(!!errors.quantity)}
          type="number"
          min={1}
          max={5000}
          inputMode="numeric"
          {...register("quantity", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Purpose"
        error={errors.purpose?.message}
        required
      >
        <textarea
          rows={5}
          className={cn(inputClass(!!errors.purpose), "h-auto py-2.5")}
          placeholder="Where and why you will plant these saplings"
          {...register("purpose")}
        />
      </Field>

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
        disabled={pending}
        className="inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60 hover:bg-bark"
      >
        {pending ? "Submitting…" : "Submit plant request"}
      </button>
    </form>
  );
}
