"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectStatus, PublishStatus } from "@prisma/client";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { ImagePicker } from "@/components/dashboard/image-picker";
import {
  PROJECT_STATUS_LABELS,
  formatPkr,
  projectSchema,
  type ProjectInput,
} from "@/lib/validators/project";
import { createProject, updateProject } from "@/server/actions/project";
import type { ActionResult } from "@/server/actions/types";

const STATUS_OPTIONS = Object.values(PublishStatus).map((s) => ({
  label: s,
  value: s,
}));

const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus).map((s) => ({
  label: PROJECT_STATUS_LABELS[s],
  value: s,
}));

export type OrgOption = {
  id: string;
  name: string;
  regionId?: string;
  circleId?: string;
};

type Props = {
  mode: "create" | "edit";
  projectId?: string;
  defaults: ProjectInput;
  regions: OrgOption[];
  circles: OrgOption[];
  divisions: OrgOption[];
};

type OwnerIds = {
  regionId: string | null;
  circleId: string | null;
  divisionId: string | null;
};

function OwnerSelector({
  regions,
  circles,
  divisions,
  value,
  onChange,
}: {
  regions: OrgOption[];
  circles: OrgOption[];
  divisions: OrgOption[];
  value: OwnerIds;
  onChange: (next: OwnerIds) => void;
}) {
  const filteredCircles = useMemo(
    () =>
      value.regionId
        ? circles.filter((c) => c.regionId === value.regionId)
        : circles,
    [circles, value.regionId]
  );
  const filteredDivisions = useMemo(
    () =>
      value.circleId
        ? divisions.filter((d) => d.circleId === value.circleId)
        : value.regionId
          ? divisions.filter((d) =>
              filteredCircles.some((c) => c.id === d.circleId)
            )
          : divisions,
    [divisions, value.circleId, value.regionId, filteredCircles]
  );

  const selectClass =
    "mt-1 h-10 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm text-bark";

  return (
    <div className="space-y-3 rounded-[12px] border border-mist p-4">
      <p className="text-sm font-medium text-bark">Owner</p>
      <label className="block text-sm text-bark">
        Region
        <select
          className={selectClass}
          value={value.regionId ?? ""}
          onChange={(e) => {
            const next = e.target.value || null;
            onChange({ regionId: next, circleId: null, divisionId: null });
          }}
        >
          <option value="">None</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-bark">
        Circle
        <select
          className={selectClass}
          value={value.circleId ?? ""}
          onChange={(e) => {
            const next = e.target.value || null;
            const circle = circles.find((c) => c.id === next);
            onChange({
              regionId: circle?.regionId ?? value.regionId,
              circleId: next,
              divisionId: null,
            });
          }}
        >
          <option value="">None</option>
          {filteredCircles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-bark">
        Division
        <select
          className={selectClass}
          value={value.divisionId ?? ""}
          onChange={(e) => {
            const next = e.target.value || null;
            const division = divisions.find((d) => d.id === next);
            const circle = circles.find((c) => c.id === division?.circleId);
            onChange({
              regionId: circle?.regionId ?? value.regionId,
              circleId: division?.circleId ?? value.circleId,
              divisionId: next,
            });
          }}
        >
          <option value="">None</option>
          {filteredDivisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function OwnerField({
  regions,
  circles,
  divisions,
  defaults,
  setValue,
}: {
  regions: OrgOption[];
  circles: OrgOption[];
  divisions: OrgOption[];
  defaults: ProjectInput;
  setValue: (name: "regionId" | "circleId" | "divisionId", value: unknown) => void;
}) {
  const [owner, setOwner] = useState<OwnerIds>({
    regionId: defaults.regionId ?? null,
    circleId: defaults.circleId ?? null,
    divisionId: defaults.divisionId ?? null,
  });

  return (
    <OwnerSelector
      regions={regions}
      circles={circles}
      divisions={divisions}
      value={owner}
      onChange={(next) => {
        setOwner(next);
        setValue("regionId", next.regionId);
        setValue("circleId", next.circleId);
        setValue("divisionId", next.divisionId);
      }}
    />
  );
}

export function ProjectForm({
  mode,
  projectId,
  defaults,
  regions,
  circles,
  divisions,
}: Props) {
  const router = useRouter();

  const fields: FieldDescriptor<ProjectInput>[] = [
    { name: "title", label: "Title", tab: "en" },
    { name: "titleUr", label: "Title (Urdu)", tab: "ur" },
    { name: "slug", label: "Slug", tab: "all", placeholder: "watershed-rehab" },
    {
      name: "projectStatus",
      label: "Project status",
      type: "select",
      options: PROJECT_STATUS_OPTIONS,
      tab: "all",
    },
    { name: "summary", label: "Summary", type: "textarea", tab: "en", rows: 3 },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      tab: "en",
      rows: 8,
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
      label: "Document / attachment",
      tab: "all",
      render: ({ value, onChange }) => (
        <ImagePicker
          value={typeof value === "string" ? value : null}
          onChange={(url) => onChange(url)}
          label="Choose file"
        />
      ),
    },
    { name: "costPkr", label: "Cost (PKR)", type: "number", tab: "all" },
    { name: "fundingSource", label: "Funding source", tab: "all" },
    { name: "startDate", label: "Start date", type: "date", tab: "all" },
    { name: "endDate", label: "End date", type: "date", tab: "all" },
    {
      name: "progressPct",
      label: "Progress %",
      type: "slider",
      min: 0,
      max: 100,
      tab: "all",
    },
    {
      name: "regionId",
      label: "Organisation owner",
      tab: "all",
      render: ({ setValue }) => (
        <OwnerField
          regions={regions}
          circles={circles}
          divisions={divisions}
          defaults={defaults}
          setValue={(name, value) => setValue(name, value)}
        />
      ),
    },
    {
      name: "status",
      label: "Publish status",
      type: "select",
      options: STATUS_OPTIONS,
      tab: "all",
    },
  ];

  return (
    <ResourceForm
      schema={projectSchema}
      fields={fields}
      defaultValues={defaults}
      showLanguageTabs
      autoSlug
      submitLabel={mode === "create" ? "Create project" : "Save project"}
      preview={(values) => (
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-resin">
            {PROJECT_STATUS_LABELS[values.projectStatus as ProjectStatus] ??
              values.projectStatus}
          </p>
          <p className="font-display text-lg text-bark">{values.title || "Untitled"}</p>
          <p className="font-mono text-xs text-moss">
            {formatPkr(typeof values.costPkr === "number" ? values.costPkr : null)}
          </p>
          <p className="font-mono text-xs text-moss">
            Progress {Number(values.progressPct ?? 0)}%
          </p>
        </div>
      )}
      onSubmit={async (values): Promise<ActionResult> => {
        const result =
          mode === "create"
            ? await createProject(values)
            : await updateProject(projectId!, values);
        if (result.ok) {
          router.push("/dashboard/projects");
          router.refresh();
        }
        return result;
      }}
    />
  );
}
