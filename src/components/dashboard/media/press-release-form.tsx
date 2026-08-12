"use client";

import { useRouter } from "next/navigation";
import { MediaKind, PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { FilePicker } from "@/components/dashboard/file-picker";
import {
  pressReleaseSchema,
  type PressReleaseInput,
} from "@/lib/validators/media";
import { createPressRelease, updatePressRelease } from "@/server/actions/media";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  postId?: string;
  defaults: PressReleaseInput;
};

export function PressReleaseForm({ mode, postId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<PressReleaseInput>[] = [
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
      rows: 10,
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
    {
      name: "documentUrl",
      label: "Document",
      tab: "all",
      render: ({ value, onChange }) => (
        <FilePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url ?? "")}
        />
      ),
    },
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
      schema={pressReleaseSchema}
      fields={fields}
      defaultValues={{ ...defaults, kind: MediaKind.PRESS_RELEASE }}
      showLanguageTabs
      autoSlug
      submitLabel={mode === "create" ? "Create press release" : "Save press release"}
      preview={(values) => (
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-resin">
            Press release
          </p>
          <p className="font-sans text-sm font-medium text-bark">
            {values.title || "Untitled release"}
          </p>
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const payload = { ...values, kind: MediaKind.PRESS_RELEASE };
        const result =
          mode === "create"
            ? await createPressRelease(payload)
            : await updatePressRelease(postId!, payload);
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
