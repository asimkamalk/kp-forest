"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { siteSettingSchema, type SiteSettingInput } from "@/lib/validators/admin";
import { updateSiteSettings } from "@/server/actions/settings";
import { cn } from "@/lib/utils";

type Props = {
  defaults: SiteSettingInput;
};

export function SettingsForm({ defaults }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SiteSettingInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(siteSettingSchema as any),
    defaultValues: defaults,
  });

  const maintenanceMode = watch("maintenanceMode");

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await updateSiteSettings(values);
      if (result.ok) {
        toast.success("Settings saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-8">
      <section className="space-y-5 rounded-[12px] border border-mist bg-white p-6">
        <h2 className="font-display text-xl text-bark">Identity</h2>
        <Field label="Site name" error={errors.siteName?.message} required>
          <input className={inputClass(!!errors.siteName)} {...register("siteName")} />
        </Field>
        <Field label="Site name (Urdu)" error={errors.siteNameUr?.message}>
          <input
            dir="rtl"
            className={inputClass(!!errors.siteNameUr)}
            {...register("siteNameUr")}
          />
        </Field>
        <Field label="Tagline" error={errors.tagline?.message}>
          <input className={inputClass(!!errors.tagline)} {...register("tagline")} />
        </Field>
        <Field label="Tagline (Urdu)" error={errors.taglineUr?.message}>
          <input
            dir="rtl"
            className={inputClass(!!errors.taglineUr)}
            {...register("taglineUr")}
          />
        </Field>
      </section>

      <section className="space-y-5 rounded-[12px] border border-mist bg-white p-6">
        <h2 className="font-display text-xl text-bark">Branding</h2>
        <Field label="Logo">
          <Controller
            control={control}
            name="logoUrl"
            render={({ field }) => (
              <ImagePicker
                value={field.value ?? null}
                onChange={(url) => field.onChange(url)}
                label="Choose logo"
              />
            )}
          />
        </Field>
        <Field label="Favicon">
          <Controller
            control={control}
            name="faviconUrl"
            render={({ field }) => (
              <ImagePicker
                value={field.value ?? null}
                onChange={(url) => field.onChange(url)}
                label="Choose favicon"
              />
            )}
          />
        </Field>
        <Field label="Emblem">
          <Controller
            control={control}
            name="emblemUrl"
            render={({ field }) => (
              <ImagePicker
                value={field.value ?? null}
                onChange={(url) => field.onChange(url)}
                label="Choose emblem"
              />
            )}
          />
        </Field>
      </section>

      <section className="space-y-5 rounded-[12px] border border-mist bg-white p-6">
        <h2 className="font-display text-xl text-bark">Contact</h2>
        <Field label="Address" error={errors.address?.message}>
          <textarea
            rows={3}
            className={cn(inputClass(!!errors.address), "h-auto py-2.5")}
            {...register("address")}
          />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input className={inputClass(!!errors.phone)} {...register("phone")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" className={inputClass(!!errors.email)} {...register("email")} />
        </Field>
        <Field label="Helpline" error={errors.helplineNumber?.message}>
          <input
            className={inputClass(!!errors.helplineNumber)}
            {...register("helplineNumber")}
          />
        </Field>
        <Field label="Footer note" error={errors.footerNote?.message}>
          <textarea
            rows={2}
            className={cn(inputClass(!!errors.footerNote), "h-auto py-2.5")}
            {...register("footerNote")}
          />
        </Field>
        <Field label="Google Analytics ID" error={errors.googleAnalytics?.message}>
          <input
            className={inputClass(!!errors.googleAnalytics)}
            placeholder="G-XXXXXXXX"
            {...register("googleAnalytics")}
          />
        </Field>
      </section>

      <section
        className={cn(
          "space-y-4 rounded-[12px] border p-6",
          maintenanceMode
            ? "border-resin bg-resin/10"
            : "border-mist bg-white"
        )}
      >
        <h2 className="font-display text-xl text-bark">Maintenance</h2>
        <Controller
          control={control}
          name="maintenanceMode"
          render={({ field }) => (
            <label className="flex items-start gap-3 text-sm text-bark">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-mist accent-resin"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span>
                <span className="font-medium">Enable maintenance mode</span>
                <span className="mt-1 block text-moss">
                  Warning: this takes the public site offline for visitors. Only the login
                  and dashboard remain reachable. Confirm you intend to do this before
                  saving.
                </span>
              </span>
            </label>
          )}
        />
      </section>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60 hover:bg-bark"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-bark">
        {label}
        {required && <span className="text-resin"> *</span>}
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
    "h-10 w-full rounded-[8px] border bg-paper px-3 text-sm text-bark outline-none focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30",
    invalid ? "border-resin" : "border-mist"
  );
}
