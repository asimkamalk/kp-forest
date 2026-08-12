"use client";

import { useRouter } from "next/navigation";
import { PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import { divisionSchema, type DivisionInput } from "@/lib/validators/org";
import { createDivision, updateDivision } from "@/server/actions/division";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({ label: s, value: s }));

type Props = {
  mode: "create" | "edit";
  divisionId?: string;
  defaults: DivisionInput;
  circles: { id: string; name: string; regionName: string }[];
};

export function DivisionForm({ mode, divisionId, defaults, circles }: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<DivisionInput>[] = [
    {
      name: "circleId",
      label: "Circle",
      type: "select",
      options: circles.map((c) => ({
        label: `${c.regionName} · ${c.name}`,
        value: c.id,
      })),
      tab: "all",
    },
    { name: "name", label: "Name", tab: "en" },
    { name: "nameUr", label: "Name (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all" },
    { name: "headquarters", label: "Headquarters", tab: "all" },
    { name: "forestType", label: "Forest type", tab: "en" },
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
      schema={divisionSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      submitLabel={mode === "create" ? "Create division" : "Save division"}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createDivision(values)
            : await updateDivision(divisionId!, values);
        if (result.ok) {
          router.push("/dashboard/divisions");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
