"use client";

import { useRouter } from "next/navigation";
import { MediaKind, PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import {
  newsCoverageSchema,
  type NewsCoverageInput,
} from "@/lib/validators/media";
import { createNewsCoverage, updateNewsCoverage } from "@/server/actions/media";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  postId?: string;
  defaults: NewsCoverageInput;
};

export function NewsCoverageForm({ mode, postId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<NewsCoverageInput>[] = [
    { name: "title", label: "Title", tab: "en" },
    { name: "titleUr", label: "Title (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all" },
    {
      name: "summary",
      label: "Summary",
      type: "textarea",
      tab: "en",
      rows: 3,
    },
    {
      name: "body",
      label: "Body",
      type: "textarea",
      tab: "en",
      rows: 6,
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
    { name: "sourceName", label: "Source name", tab: "all" },
    { name: "sourceUrl", label: "Source URL", type: "url", tab: "all" },
    { name: "publishedAt", label: "Published date", type: "date", tab: "all" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: STATUS_OPTIONS,
      tab: "all",
    },
  ];

  return (
    <ResourceForm
      schema={newsCoverageSchema}
      fields={fields}
      defaultValues={{ ...defaults, kind: MediaKind.NEWS_COVERAGE }}
      showLanguageTabs
      autoSlug
      submitLabel={mode === "create" ? "Create news item" : "Save news item"}
      preview={(values) => (
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-resin">
            {values.sourceName || "News coverage"}
          </p>
          <p className="font-sans text-sm font-medium text-bark">
            {values.title || "Untitled coverage"}
          </p>
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const payload = { ...values, kind: MediaKind.NEWS_COVERAGE };
        const result =
          mode === "create"
            ? await createNewsCoverage(payload)
            : await updateNewsCoverage(postId!, payload);
        if (result.ok) {
          router.push("/dashboard/media");
          router.refresh();
        }
        return result;
      }}
      onCancel={() => router.push("/dashboard/media")}
    />
  );
}
