"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { heroSlideSchema, type HeroSlideInput } from "@/lib/validators/hero";
import { createHeroSlide, updateHeroSlide } from "@/server/actions/hero";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  slideId?: string;
  defaults: HeroSlideInput;
};

export function HeroForm({ mode, slideId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<HeroSlideInput>[] = [
    { name: "title", label: "Title", tab: "en" },
    { name: "titleUr", label: "Title (Urdu)", tab: "ur" },
    { name: "subtitle", label: "Subtitle", type: "textarea", tab: "en", rows: 2 },
    { name: "subtitleUr", label: "Subtitle (Urdu)", type: "textarea", tab: "ur", rows: 2 },
    {
      name: "imageUrl",
      label: "Background image",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
        />
      ),
    },
    { name: "imageAlt", label: "Image alt text", tab: "all" },
    { name: "ctaLabel", label: "Primary CTA label", tab: "en" },
    { name: "ctaHref", label: "Primary CTA href", tab: "all", placeholder: "/regions" },
    { name: "secondaryCtaLabel", label: "Secondary CTA label", tab: "en" },
    {
      name: "secondaryCtaHref",
      label: "Secondary CTA href",
      tab: "all",
      placeholder: "/projects/ongoing",
    },
    {
      name: "overlayOpacity",
      label: "Overlay opacity",
      type: "slider",
      min: 0,
      max: 100,
      tab: "all",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
      tab: "all",
    },
    { name: "startsAt", label: "Starts at", type: "date", tab: "all" },
    { name: "endsAt", label: "Ends at", type: "date", tab: "all" },
    { name: "orderIndex", label: "Order", type: "number", tab: "all" },
  ];

  return (
    <ResourceForm
      schema={heroSlideSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      submitLabel={mode === "create" ? "Create slide" : "Save slide"}
      preview={(values) => (
        <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-bark">
          {values.imageUrl ? (
            <Image
              src={String(values.imageUrl)}
              alt={values.imageAlt ? String(values.imageAlt) : ""}
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-bark"
            style={{
              opacity: Math.min(100, Math.max(0, Number(values.overlayOpacity ?? 45))) / 100,
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4 text-paper">
            <p className="font-display text-lg leading-tight">{values.title || "Title"}</p>
            {values.subtitle && (
              <p className="mt-1 text-xs text-paper/80">{values.subtitle}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {values.ctaLabel && (
                <span className="rounded-[8px] bg-resin px-2.5 py-1 text-[11px] font-medium text-bark">
                  {values.ctaLabel}
                </span>
              )}
              {values.secondaryCtaLabel && (
                <span className="rounded-[8px] border border-paper/40 px-2.5 py-1 text-[11px]">
                  {values.secondaryCtaLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createHeroSlide(values)
            : await updateHeroSlide(slideId!, values);
        if (result.ok) {
          router.push("/dashboard/hero");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
