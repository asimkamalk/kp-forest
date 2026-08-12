"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePicker } from "@/components/dashboard/image-picker";
import {
  ROLE_OPTIONS,
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/validators/admin";
import { createUser, updateUser } from "@/server/actions/users";
import { cn } from "@/lib/utils";

type OrgOptions = {
  regions: { id: string; name: string }[];
  circles: { id: string; name: string; regionId: string }[];
  divisions: { id: string; name: string; circleId: string }[];
};

type CreateProps = {
  mode: "create";
  org: OrgOptions;
  defaults: CreateUserInput;
};

type EditProps = {
  mode: "edit";
  userId: string;
  org: OrgOptions;
  defaults: UpdateUserInput;
  lockRoleAndActive: boolean;
};

type Props = CreateProps | EditProps;

export function UserForm(props: Props) {
  const router = useRouter();
  const schema = props.mode === "create" ? createUserSchema : updateUserSchema;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: props.defaults,
  });

  const role = watch("role") as Role;
  const regionId = watch("regionId") as string | null | undefined;

  const circleOptions = useMemo(() => {
    if (role !== Role.CIRCLE_ADMIN && role !== Role.DIVISION_ADMIN) return [];
    return props.org.circles;
  }, [props.org.circles, role]);

  const divisionOptions = useMemo(() => {
    if (role !== Role.DIVISION_ADMIN) return [];
    if (!regionId) return props.org.divisions;
    const circleIds = new Set(
      props.org.circles.filter((c) => c.regionId === regionId).map((c) => c.id)
    );
    return props.org.divisions.filter((d) => circleIds.has(d.circleId));
  }, [props.org, regionId, role]);

  const onSubmit = handleSubmit(async (values) => {
    const result =
      props.mode === "create"
        ? await createUser(values)
        : await updateUser(props.userId, values);
    if (result.ok) {
      toast.success(props.mode === "create" ? "User created" : "User saved");
      router.push("/dashboard/users");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  });

  const lock = props.mode === "edit" && props.lockRoleAndActive;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <Field label="Name" error={errors.name?.message as string | undefined} required>
        <input className={inputClass(!!errors.name)} {...register("name")} />
      </Field>
      <Field label="Email" error={errors.email?.message as string | undefined} required>
        <input
          type="email"
          className={inputClass(!!errors.email)}
          autoComplete="off"
          {...register("email")}
        />
      </Field>
      {props.mode === "create" && (
        <Field
          label="Password"
          error={(errors as { password?: { message?: string } }).password?.message}
          required
        >
          <input
            type="password"
            className={inputClass(!!(errors as { password?: unknown }).password)}
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
      )}
      <Field label="Role" error={errors.role?.message as string | undefined} required>
        <select
          className={inputClass(!!errors.role)}
          disabled={lock}
          {...register("role", {
            onChange: () => {
              setValue("regionId", null);
              setValue("circleId", null);
              setValue("divisionId", null);
            },
          })}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {lock && (
          <p className="mt-1.5 text-xs text-moss">You cannot change your own role.</p>
        )}
      </Field>

      {role === Role.REGION_ADMIN && (
        <Field label="Region" error={errors.regionId?.message as string | undefined} required>
          <select className={inputClass(!!errors.regionId)} {...register("regionId")}>
            <option value="">Select region</option>
            {props.org.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {role === Role.CIRCLE_ADMIN && (
        <Field label="Circle" error={errors.circleId?.message as string | undefined} required>
          <select className={inputClass(!!errors.circleId)} {...register("circleId")}>
            <option value="">Select circle</option>
            {circleOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      {role === Role.DIVISION_ADMIN && (
        <Field
          label="Division"
          error={errors.divisionId?.message as string | undefined}
          required
        >
          <select className={inputClass(!!errors.divisionId)} {...register("divisionId")}>
            <option value="">Select division</option>
            {divisionOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Designation" error={errors.designation?.message as string | undefined}>
        <input className={inputClass(!!errors.designation)} {...register("designation")} />
      </Field>
      <Field label="Phone" error={errors.phone?.message as string | undefined}>
        <input className={inputClass(!!errors.phone)} {...register("phone")} />
      </Field>
      <Field label="Avatar">
        <Controller
          control={control}
          name="avatarUrl"
          render={({ field }) => (
            <ImagePicker
              value={typeof field.value === "string" ? field.value : null}
              onChange={(url) => field.onChange(url)}
            />
          )}
        />
      </Field>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-bark">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-mist accent-deodar"
              checked={Boolean(field.value)}
              disabled={lock}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            Active
            {lock && (
              <span className="text-xs text-moss">(you cannot deactivate yourself)</span>
            )}
          </label>
        )}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 items-center rounded-[8px] bg-deodar px-5 text-sm font-medium text-paper disabled:opacity-60 hover:bg-bark"
      >
        {isSubmitting
          ? "Saving…"
          : props.mode === "create"
            ? "Create user"
            : "Save user"}
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
