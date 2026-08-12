"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { RequestKind, RequestStatus } from "@prisma/client";
import { DataTable } from "@/components/dashboard/data-table";
import { KP_DISTRICTS } from "@/lib/validators/contact";
import {
  exportPublicRequestsCsv,
  type RequestExportFilter,
} from "@/server/actions/contact";
import { cn } from "@/lib/utils";

export type RequestRow = {
  id: string;
  ticketNo: string;
  kind: RequestKind;
  subject: string | null;
  fullName: string;
  district: string | null;
  requestStatus: RequestStatus;
  createdAt: string;
};

const PIPELINE: { key: string; label: string; statuses: RequestStatus[] }[] = [
  { key: "NEW", label: "New", statuses: [RequestStatus.NEW] },
  { key: "IN_REVIEW", label: "In review", statuses: [RequestStatus.IN_REVIEW] },
  {
    key: "DECIDED",
    label: "Approved / Rejected",
    statuses: [RequestStatus.APPROVED, RequestStatus.REJECTED],
  },
  { key: "FULFILLED", label: "Fulfilled", statuses: [RequestStatus.FULFILLED] },
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  NEW: "bg-mist text-bark",
  IN_REVIEW: "bg-resin/15 text-resin",
  APPROVED: "bg-deodar/15 text-deodar",
  REJECTED: "bg-bark/10 text-moss",
  FULFILLED: "bg-deodar/25 text-deodar",
};

const columns: ColumnDef<RequestRow, unknown>[] = [
  { accessorKey: "ticketNo", header: "Ticket" },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => row.original.subject ?? row.original.kind,
  },
  { accessorKey: "fullName", header: "Name" },
  {
    accessorKey: "district",
    header: "District",
    cell: ({ row }) => row.original.district ?? "—",
  },
  {
    accessorKey: "requestStatus",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={cn(
          "inline-flex rounded-[8px] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
          STATUS_STYLE[row.original.requestStatus]
        )}
      >
        {row.original.requestStatus}
      </span>
    ),
  },
  {
    id: "createdAt",
    accessorFn: (row) => new Date(row.createdAt).getTime(),
    header: "Date",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-moss">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

type Props = { rows: RequestRow[] };

export function RequestsInboxClient({ rows }: Props) {
  const [view, setView] = useState<"pipeline" | "table">("pipeline");
  const [kind, setKind] = useState("all");
  const [district, setDistrict] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, startExport] = useTransition();

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (district !== "all" && r.district !== district) return false;
      const t = new Date(r.createdAt).getTime();
      if (from && t < new Date(from).getTime()) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (t > end.getTime()) return false;
      }
      return true;
    });
  }, [rows, kind, district, from, to]);

  const onExport = () => {
    const filter: RequestExportFilter = {
      kind,
      district,
      from: from || undefined,
      to: to || undefined,
    };
    startExport(async () => {
      const result = await exportPublicRequestsCsv(filter);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `requests-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.data.count} rows`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-bark">
          Kind
          <select
            className="mt-1 block h-9 rounded-[8px] border border-mist bg-paper px-2"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="all">All</option>
            {Object.values(RequestKind).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-bark">
          District
          <select
            className="mt-1 block h-9 max-w-[180px] rounded-[8px] border border-mist bg-paper px-2"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="all">All</option>
            {KP_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-bark">
          From
          <input
            type="date"
            className="mt-1 block h-9 rounded-[8px] border border-mist bg-paper px-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm text-bark">
          To
          <input
            type="date"
            className="mt-1 block h-9 rounded-[8px] border border-mist bg-paper px-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="inline-flex rounded-[8px] border border-mist p-0.5">
            <button
              type="button"
              className={cn(
                "h-8 rounded-[6px] px-3 text-xs font-medium",
                view === "pipeline" ? "bg-deodar text-paper" : "text-moss hover:text-bark"
              )}
              onClick={() => setView("pipeline")}
            >
              Pipeline
            </button>
            <button
              type="button"
              className={cn(
                "h-8 rounded-[6px] px-3 text-xs font-medium",
                view === "table" ? "bg-deodar text-paper" : "text-moss hover:text-bark"
              )}
              onClick={() => setView("table")}
            >
              Table
            </button>
          </div>
          <button
            type="button"
            disabled={exporting}
            onClick={onExport}
            className="h-9 rounded-[8px] border border-mist px-3 text-sm text-bark hover:bg-mist/40 disabled:opacity-60"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {view === "pipeline" ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {PIPELINE.map((col) => {
            const items = filtered.filter((r) => col.statuses.includes(r.requestStatus));
            return (
              <section
                key={col.key}
                className="rounded-[12px] border border-mist bg-paper p-3 shadow-[var(--shadow-card)]"
              >
                <header className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-mono text-[11px] font-medium uppercase tracking-wider text-moss">
                    {col.label}
                  </h2>
                  <span className="font-mono text-xs text-bark">{items.length}</span>
                </header>
                <ul className="space-y-2">
                  {items.length === 0 ? (
                    <li className="px-1 py-6 text-center text-xs text-moss">None</li>
                  ) : (
                    items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/dashboard/requests/${item.id}`}
                          className="block rounded-[8px] border border-mist bg-paper p-3 transition-colors hover:border-deodar/40 hover:bg-mist/30"
                        >
                          <p className="font-mono text-[11px] text-resin">{item.ticketNo}</p>
                          <p className="mt-1 truncate text-sm font-medium text-bark">
                            {item.fullName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-moss">
                            {item.subject ?? item.kind}
                            {item.district ? ` · ${item.district}` : ""}
                          </p>
                          <p className="mt-2 font-mono text-[10px] text-moss">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(row) => row.id}
          actions={[
            {
              label: "Open",
              href: (row) => `/dashboard/requests/${row.id}`,
            },
          ]}
          searchPlaceholder="Filter by ticket or name…"
          emptyMessage="No requests match these filters."
        />
      )}
    </div>
  );
}
