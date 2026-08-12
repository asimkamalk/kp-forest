"use client";

import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { circleSchema, type CircleInput } from "@/lib/validators/org";
import { createCircle, updateCircle } from "@/server/actions/circle";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({ label: s, value: s }));

type Props = {
  mode: "create" | "edit";
  circleId?: string;
  defaults: CircleInput;
  regions: { id: string; name: string }[];
};

export function CircleForm({ mode, circleId, defaults, regions }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<CircleInput>[] = [
    {
      name: "regionId",
      label: "Region",
      type: "select",
      options: regions.map((r) => ({ label: r.name, value: r.id })),
      tab: "all",
    },
    { name: "name", label: "Name", tab: "en" },
    { name: "nameUr", label: "Name (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all" },
    { name: "headquarters", label: "Headquarters", tab: "all" },
    { name: "shortDesc", label: "Short description", type: "textarea", tab: "en", rows: 2 },
    { name: "description", label: "Description", type: "textarea", tab: "en", rows: 5 },
    { name: "descriptionUr", label: "Description (Urdu)", type: "textarea", tab: "ur", rows: 5 },
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
    { name: "officerName", label: "Officer name", tab: "en" },
    { name: "officerDesignation", label: "Officer designation", tab: "en" },
    {
      name: "officerPhoto",
      label: "Officer photo",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
          label="Choose photo"
        />
      ),
    },
    { name: "contactPhone", label: "Phone", tab: "all" },
    { name: "contactEmail", label: "Email", type: "email", tab: "all" },
    { name: "address", label: "Address", type: "textarea", tab: "all", rows: 2 },
    { name: "centerLat", label: "Center latitude", type: "number", tab: "all" },
    { name: "centerLng", label: "Center longitude", type: "number", tab: "all" },
    { name: "areaHectares", label: "Area (hectares)", type: "number", tab: "all" },
    {
      name: "mapGeoJson",
      label: "Map GeoJSON",
      type: "json",
      tab: "all",
      rows: 8,
      description: "Paste a Feature or FeatureCollection JSON string.",
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
      schema={circleSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      submitLabel={mode === "create" ? "Create circle" : "Save circle"}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createCircle(values)
            : await updateCircle(circleId!, values);
        if (result.ok) {
          router.push("/dashboard/circles");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
