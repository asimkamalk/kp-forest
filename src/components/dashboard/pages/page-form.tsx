"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { pageSchema, type PageInput } from "@/lib/validators/admin";
import { createPage, updatePage } from "@/server/actions/pages";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  pageId?: string;
  defaults: PageInput;
};

export function PageForm({ mode, pageId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<PageInput>[] = [
    { name: "title", label: "Title", tab: "en" },
    { name: "titleUr", label: "Title (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all", placeholder: "vision-mission" },
    { name: "summary", label: "Summary", type: "textarea", tab: "en", rows: 3 },
    {
      name: "body",
      label: "Body",
      tab: "en",
      render: ({ value, onChange, error }) => (
        <RichTextEditor
          value={typeof value === "string" ? value : ""}
          onChange={(html) => onChange(html)}
          error={error}
        />
      ),
    },
    {
      name: "bodyUr",
      label: "Body (Urdu)",
      tab: "ur",
      render: ({ value, onChange, error }) => (
        <RichTextEditor
          value={typeof value === "string" ? value : ""}
          onChange={(html) => onChange(html)}
          error={error}
          dir="rtl"
        />
      ),
    },
    {
      name: "coverImage",
      label: "Cover image",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
        />
      ),
    },
    { name: "seoTitle", label: "SEO title", tab: "all" },
    {
      name: "seoDescription",
      label: "SEO description",
      type: "textarea",
      tab: "all",
      rows: 2,
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
      schema={pageSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      autoSlug
      submitLabel={mode === "create" ? "Create page" : "Save page"}
      preview={(values) => (
        <div className="space-y-3">
          {values.coverImage ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[12px] bg-mist">
              <Image
                src={String(values.coverImage)}
                alt=""
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
          ) : null}
          <p className="eyebrow text-resin">{values.slug || "slug"}</p>
          <p className="font-display text-lg text-bark">{values.title || "Title"}</p>
          {values.summary && (
            <p className="text-sm leading-relaxed text-moss">{values.summary}</p>
          )}
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create" ? await createPage(values) : await updatePage(pageId!, values);
        if (result.ok) {
          router.push("/dashboard/pages");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
