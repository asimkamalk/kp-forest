"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from "lucide-react";
import { exportAuditLogsCsv } from "@/server/actions/audit";
import { cn } from "@/lib/utils";

export type AuditRow = {
  id: string;
  createdAt: string;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  userName: string | null;
  userEmail: string | null;
  before: unknown;
  after: unknown;
};

type Props = {
  rows: AuditRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  actions: string[];
  entities: string[];
  users: { id: string; name: string; email: string }[];
  filters: {
    action: string;
    entity: string;
    userId: string;
    from: string;
    to: string;
  };
};

const ACTION_STYLE: Record<string, string> = {
  CREATE: "bg-deodar/15 text-deodar",
  UPDATE: "bg-resin/15 text-resin",
  DELETE: "bg-bark/10 text-moss",
  PUBLISH: "bg-deodar/25 text-deodar",
  LOGIN: "bg-mist text-bark",
  EXPORT: "bg-mist text-bark",
  RESET_PASSWORD: "bg-resin/20 text-bark",
};

export function AuditLogClient({
  rows,
  total,
  page,
  pageSize,
  totalPages,
  actions,
  entities,
  users,
  filters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exporting, startExport] = useTransition();

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  const onExport = () => {
    startExport(async () => {
      const result = await exportAuditLogsCsv({
        action: filters.action === "all" ? undefined : filters.action,
        entity: filters.entity === "all" ? undefined : filters.entity,
        userId: filters.userId === "all" ? undefined : filters.userId,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page: 1,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.data.count} rows`);
      router.refresh();
    });
  };

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 entries";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `${start}–${end} of ${total}`;
  }, [page, pageSize, total]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-[12px] border border-mist bg-white p-4">
        <FilterSelect
          label="Action"
          value={filters.action}
          onChange={(v) => setFilter("action", v)}
          options={[{ value: "all", label: "All actions" }, ...actions.map((a) => ({ value: a, label: a }))]}
        />
        <FilterSelect
          label="Entity"
          value={filters.entity}
          onChange={(v) => setFilter("entity", v)}
          options={[
            { value: "all", label: "All entities" },
            ...entities.map((e) => ({ value: e, label: e })),
          ]}
        />
        <FilterSelect
          label="User"
          value={filters.userId}
          onChange={(v) => setFilter("userId", v)}
          options={[
            { value: "all", label: "All users" },
            ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
          ]}
        />
        <label className="text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-moss">
            From
          </span>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilter("from", e.target.value)}
            className="h-10 rounded-[8px] border border-mist bg-paper px-3 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-moss">
            To
          </span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilter("to", e.target.value)}
            className="h-10 rounded-[8px] border border-mist bg-paper px-3 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="ml-auto inline-flex h-10 items-center rounded-[8px] border border-mist px-4 text-sm font-medium text-bark hover:bg-mist/40 disabled:opacity-60"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-mist bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-mist bg-mist/30 font-mono text-[10px] uppercase tracking-wider text-moss">
            <tr>
              <th className="w-8 px-3 py-3" />
              <th className="px-3 py-3">Timestamp</th>
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Entity</th>
              <th className="px-3 py-3">Entity ID</th>
              <th className="px-3 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-moss">
                  No audit entries match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const open = expanded === row.id;
                return (
                  <AuditRowBlock
                    key={row.id}
                    row={row}
                    open={open}
                    onToggle={() => setExpanded(open ? null : row.id)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-moss">
        <p className="font-mono text-xs">{rangeLabel}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setFilter("page", String(page - 1))}
            className="h-9 rounded-[8px] border border-mist px-3 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="inline-flex h-9 items-center px-2 font-mono text-xs">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setFilter("page", String(page + 1))}
            className="h-9 rounded-[8px] border border-mist px-3 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditRowBlock({
  row,
  open,
  onToggle,
}: {
  row: AuditRow;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-mist/70 hover:bg-mist/20">
        <td className="px-3 py-2.5">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? "Hide details" : "Show before/after"}
            className="rounded p-1 text-moss hover:text-bark"
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-3 py-2.5 font-mono text-xs text-moss">
          {new Date(row.createdAt).toLocaleString()}
        </td>
        <td className="px-3 py-2.5">
          <p className="font-medium text-bark">{row.userName ?? "—"}</p>
          <p className="font-mono text-[11px] text-moss">{row.userEmail ?? ""}</p>
        </td>
        <td className="px-3 py-2.5">
          <span
            className={cn(
              "inline-flex rounded-[8px] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
              ACTION_STYLE[row.action] ?? "bg-mist text-bark"
            )}
          >
            {row.action}
          </span>
        </td>
        <td className="px-3 py-2.5 text-bark">{row.entity}</td>
        <td className="px-3 py-2.5 font-mono text-xs text-moss">{row.entityId ?? "—"}</td>
        <td className="px-3 py-2.5 font-mono text-xs text-moss">{row.ip ?? "—"}</td>
      </tr>
      {open && (
        <tr className="border-b border-mist bg-mist/15">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <JsonBlock label="Before" value={row.before} />
              <JsonBlock label="After" value={row.after} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="eyebrow mb-2 text-resin">{label}</p>
      <pre className="max-h-64 overflow-auto rounded-[8px] border border-mist bg-paper p-3 font-mono text-[11px] leading-relaxed text-bark">
        {value == null ? "null" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-moss">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 max-w-[220px] rounded-[8px] border border-mist bg-paper px-3 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
