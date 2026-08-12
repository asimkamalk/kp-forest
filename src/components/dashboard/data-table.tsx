"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type DataTableAction<T> = {
  label: string;
  onClick?: (row: T) => void;
  href?: string | ((row: T) => string);
  variant?: "default" | "destructive";
  confirm?: { title: string; description: string };
};

type Props<T> = {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId: (row: T) => string;
  actions?: DataTableAction<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "bg-mist text-bark",
    REVIEW: "bg-resin/15 text-resin",
    PUBLISHED: "bg-deodar/15 text-deodar",
    ARCHIVED: "bg-bark/10 text-moss",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-[8px] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
        styles[status] ?? "bg-mist text-bark"
      )}
    >
      {status}
    </span>
  );
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  actions = [],
  searchPlaceholder = "Filter…",
  emptyMessage = "No rows yet.",
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pendingDelete, setPendingDelete] = useState<{
    row: T;
    action: DataTableAction<T>;
  } | null>(null);

  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const selectCol: ColumnDef<T, unknown> = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-mist accent-deodar"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label="Select row"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-mist accent-deodar"
        />
      ),
      enableSorting: false,
    };

    const actionCol: ColumnDef<T, unknown> | null =
      actions.length === 0
        ? null
        : {
            id: "actions",
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="grid h-8 w-8 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-bark"
                  aria-label="Row actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-40 border-mist bg-paper text-bark shadow-[var(--shadow-card)]"
                >
                  {actions.map((action) => {
                    const href =
                      typeof action.href === "function"
                        ? action.href(row.original)
                        : action.href;
                    if (action.confirm) {
                      return (
                        <DropdownMenuItem
                          key={action.label}
                          className={cn(
                            "cursor-pointer",
                            action.variant === "destructive" && "text-resin focus:text-resin"
                          )}
                          onSelect={(e) => {
                            e.preventDefault();
                            setPendingDelete({ row: row.original, action });
                          }}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      );
                    }
                    if (href) {
                      return (
                        <DropdownMenuItem
                          key={action.label}
                          className="cursor-pointer"
                          onSelect={() => {
                            window.location.href = href;
                          }}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      );
                    }
                    return (
                      <DropdownMenuItem
                        key={action.label}
                        className="cursor-pointer"
                        onSelect={() => action.onClick?.(row.original)}
                      >
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
            enableSorting: false,
          };

    return [selectCol, ...columns, ...(actionCol ? [actionCol] : [])];
  }, [actions, columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => getRowId(row),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full max-w-xs rounded-[8px] border border-mist bg-paper px-3 text-sm text-bark outline-none placeholder:text-moss/70 focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
        />
        <p className="font-mono text-xs text-moss">
          {table.getFilteredRowModel().rows.length} rows
        </p>
      </div>

      <div className="overflow-x-auto rounded-[12px] border border-mist bg-paper shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-b border-mist bg-mist/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 font-mono text-[11px] font-medium uppercase tracking-wider text-moss"
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-bark"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-3 py-10 text-center text-sm text-moss"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-mist/70 last:border-0 hover:bg-mist/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle text-bark">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-moss">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="h-8 rounded-[8px] border border-mist px-3 text-xs text-bark disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            type="button"
            className="h-8 rounded-[8px] border border-mist px-3 text-xs text-bark disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="border-mist bg-paper text-bark sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pendingDelete?.action.confirm?.title ?? "Confirm"}</DialogTitle>
            <DialogDescription className="text-moss">
              {pendingDelete?.action.confirm?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              className="h-9 rounded-[8px] border border-mist px-4 text-sm"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="h-9 rounded-[8px] bg-resin px-4 text-sm font-medium text-bark"
              onClick={() => {
                if (pendingDelete) {
                  pendingDelete.action.onClick?.(pendingDelete.row);
                  setPendingDelete(null);
                }
              }}
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
