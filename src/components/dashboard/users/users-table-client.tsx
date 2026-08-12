"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, type DataTableAction } from "@/components/dashboard/data-table";
import { deleteUser } from "@/server/actions/users";
import { cn } from "@/lib/utils";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  scope: string;
  isActive: boolean;
  lastLoginAt: string | null;
};

const ROLE_STYLE: Record<string, string> = {
  SUPER_ADMIN: "bg-bark text-paper",
  REGION_ADMIN: "bg-deodar/20 text-deodar",
  CIRCLE_ADMIN: "bg-deodar/15 text-deodar",
  DIVISION_ADMIN: "bg-moss/25 text-bark",
  EDITOR: "bg-resin/15 text-resin",
  VIEWER: "bg-mist text-bark",
};

const columns: ColumnDef<UserRow, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex rounded-[8px] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
          ROLE_STYLE[row.original.role] ?? "bg-mist text-bark"
        )}
      >
        {row.original.role.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "scope",
    header: "Scope",
    cell: ({ row }) => row.original.scope || "—",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
  },
  {
    id: "lastLoginAt",
    accessorFn: (row) => (row.lastLoginAt ? new Date(row.lastLoginAt).getTime() : 0),
    header: "Last login",
    cell: ({ row }) =>
      row.original.lastLoginAt
        ? new Date(row.original.lastLoginAt).toLocaleString()
        : "—",
  },
];

type Props = {
  rows: UserRow[];
  currentUserId: string;
};

export function UsersTableClient({ rows, currentUserId }: Props) {
  const router = useRouter();

  const actions: DataTableAction<UserRow>[] = [
    { label: "Edit", href: (row) => `/dashboard/users/${row.id}` },
    {
      label: "Delete",
      variant: "destructive",
      confirm: {
        title: "Delete user?",
        description:
          "The account is removed. Audit log entries stay, with the user field cleared.",
      },
      onClick: async (row) => {
        if (row.id === currentUserId) {
          toast.error("You cannot delete your own account");
          return;
        }
        const result = await deleteUser(row.id);
        if (result.ok) {
          toast.success("User deleted");
          router.refresh();
        } else toast.error(result.error);
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      actions={actions}
      searchPlaceholder="Filter by name or email…"
    />
  );
}

export function ResetPasswordPanel({ userId }: { userId: string }) {
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="rounded-[12px] border border-mist bg-white p-5">
      <h2 className="font-sans text-sm font-semibold text-bark">Reset password</h2>
      <p className="mt-1 text-sm text-moss">
        Sets a new password. The hash is never shown. Minimum 10 characters.
      </p>
      <form
        className="mt-4 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const { resetUserPassword } = await import("@/server/actions/users");
            const result = await resetUserPassword(userId, { password });
            if (result.ok) {
              toast.success("Password reset");
              setPassword("");
              router.refresh();
            } else toast.error(result.error);
          });
        }}
      >
        <label className="min-w-[240px] flex-1 text-sm">
          <span className="mb-1.5 block font-medium text-bark">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="h-10 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm"
            required
            minLength={10}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-[8px] bg-bark px-4 text-sm font-medium text-paper disabled:opacity-60"
        >
          {pending ? "Saving…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
