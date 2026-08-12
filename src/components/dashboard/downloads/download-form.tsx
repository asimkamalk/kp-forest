"use client";

import { useRouter } from "next/navigation";
import { DownloadKind, PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { FilePicker } from "@/components/dashboard/file-picker";
import {
  DOWNLOAD_KIND_LABELS,
  downloadSchema,
  formatFileSize,
  type DownloadInput,
} from "@/lib/validators/download";
import { createDownload, updateDownload } from "@/server/actions/download";
import type { ActionResult } from "@/server/actions/types";

const KIND_OPTIONS = Object.values(DownloadKind).map((k) => ({
  label: DOWNLOAD_KIND_LABELS[k],
  value: k,
}));

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  downloadId?: string;
  defaults: DownloadInput;
};

export function DownloadForm({ mode, downloadId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<DownloadInput>[] = [
    { name: "title", label: "Title", tab: "en" },
    { name: "titleUr", label: "Title (Urdu)", tab: "ur" },
    {
      name: "kind",
      label: "Kind",
      type: "select",
      options: KIND_OPTIONS,
      tab: "all",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      tab: "en",
      rows: 3,
    },
    {
      name: "fileUrl",
      label: "File",
      tab: "all",
      render: ({ value, onChange, setValue }) => (
        <FilePicker
          value={typeof value === "string" ? value : null}
          fileSize={typeof defaults.fileSize === "number" ? defaults.fileSize : null}
          onChange={(url, sizeBytes) => {
            onChange(url ?? "");
            setValue("fileSize", sizeBytes);
          }}
        />
      ),
    },
    { name: "documentDate", label: "Document date", type: "date", tab: "all" },
    { name: "orderIndex", label: "Order", type: "number", tab: "all" },
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
      schema={downloadSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      submitLabel={mode === "create" ? "Create download" : "Save download"}
      preview={(values) => (
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-resin">
            {DOWNLOAD_KIND_LABELS[values.kind as DownloadKind] ?? values.kind}
          </p>
          <p className="font-sans text-sm font-medium text-bark">
            {values.title || "Untitled document"}
          </p>
          <p className="font-mono text-xs text-moss">
            {formatFileSize(
              typeof values.fileSize === "number" ? values.fileSize : null
            )}
          </p>
          {values.fileUrl ? (
            <p className="truncate font-mono text-[11px] text-deodar">{String(values.fileUrl)}</p>
          ) : (
            <p className="text-xs text-moss">No file yet</p>
          )}
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createDownload(values)
            : await updateDownload(downloadId!, values);
        if (result.ok) {
          router.push("/dashboard/downloads");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
