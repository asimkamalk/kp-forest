"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { messageSchema, type MessageInput } from "@/lib/validators/message";
import { createMessage, updateMessage } from "@/server/actions/message";
import type { ActionResult } from "@/server/actions/types";

const KIND_OPTIONS = [
  { label: "Chief Minister", value: "CHIEF_MINISTER" },
  { label: "Secretary Climate Change", value: "SECRETARY_CLIMATE_CHANGE" },
  { label: "Minister", value: "MINISTER" },
  { label: "Secretary", value: "SECRETARY" },
  { label: "Chief Conservator", value: "CHIEF_CONSERVATOR" },
  { label: "Other", value: "OTHER" },
];

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

type Props = {
  mode: "create" | "edit";
  messageId?: string;
  defaults: MessageInput;
};

export function MessageForm({ mode, messageId, defaults }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<MessageInput>[] = [
    { name: "personName", label: "Person name", tab: "en" },
    { name: "personNameUr", label: "Person name (Urdu)", tab: "ur" },
    { name: "designation", label: "Designation", tab: "en" },
    { name: "designationUr", label: "Designation (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all", placeholder: "chief-minister" },
    {
      name: "kind",
      label: "Kind",
      type: "select",
      options: KIND_OPTIONS,
      tab: "all",
    },
    {
      name: "photoUrl",
      label: "Portrait",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
        />
      ),
    },
    {
      name: "signatureUrl",
      label: "Signature image",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
          label="Choose signature"
        />
      ),
    },
    { name: "excerpt", label: "Excerpt", type: "textarea", tab: "en", rows: 3 },
    { name: "excerptUr", label: "Excerpt (Urdu)", type: "textarea", tab: "ur", rows: 3 },
    { name: "body", label: "Full message", type: "textarea", tab: "en", rows: 8 },
    { name: "bodyUr", label: "Full message (Urdu)", type: "textarea", tab: "ur", rows: 8 },
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
      schema={messageSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      submitLabel={mode === "create" ? "Create message" : "Save message"}
      preview={(values) => (
        <div className="space-y-3">
          <div className="relative mx-auto aspect-[4/5] w-40 overflow-hidden rounded-xl bg-deodar">
            {values.photoUrl ? (
              <Image src={String(values.photoUrl)} alt="" fill className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center font-display text-3xl text-paper">
                {(values.personName || "?").slice(0, 1)}
              </div>
            )}
          </div>
          <p className="eyebrow text-center text-resin">{values.designation || "Designation"}</p>
          <p className="text-center font-display text-lg text-bark">
            {values.personName || "Name"}
          </p>
          {values.excerpt && (
            <p className="font-display text-sm leading-snug text-bark/80">“{values.excerpt}”</p>
          )}
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createMessage(values)
            : await updateMessage(messageId!, values);
        if (result.ok) {
          router.push("/dashboard/messages");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
