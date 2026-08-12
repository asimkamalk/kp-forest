"use client";

import { useEffect, useState, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "@/server/actions/types";
import { cn } from "@/lib/utils";

export type SortableItem = {
  id: string;
  label: string;
  meta?: ReactNode;
  /** Rendered under the row (e.g. nested child lists). */
  below?: ReactNode;
};

type Props = {
  items: SortableItem[];
  /** Pass a server action by reference — do not wrap in an inline arrow from a Server Component. */
  onReorder: (input: {
    orderedIds: string[];
    parentId?: string | null;
  }) => Promise<ActionResult>;
  /** Included in the reorder payload so nested lists can target a parent. */
  parentId?: string | null;
  className?: string;
};

export function SortableList({ items, onReorder, parentId = null, className }: Props) {
  const [list, setList] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setList(items);
  }, [items]);

  const persist = async (next: SortableItem[]) => {
    setList(next);
    setPending(true);
    const result = await onReorder({
      orderedIds: next.map((i) => i.id),
      parentId,
    });
    setPending(false);
    if (result.ok) toast.success("Order updated");
    else toast.error(result.error);
  };

  return (
    <ul className={cn("space-y-2", className)} aria-busy={pending}>
      {list.map((item, index) => (
        <li
          key={item.id}
          className={cn(
            "rounded-[12px] border border-mist bg-paper shadow-[var(--shadow-card)]",
            dragId === item.id && "opacity-60"
          )}
        >
          <div
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              setDragId(item.id);
            }}
            onDragEnd={() => setDragId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.stopPropagation();
              if (!dragId || dragId === item.id) return;
              const from = list.findIndex((i) => i.id === dragId);
              const to = index;
              if (from < 0) return;
              const next = [...list];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              setDragId(null);
              void persist(next);
            }}
            className="flex items-center gap-3 px-3 py-2.5"
          >
            <span className="cursor-grab text-moss active:cursor-grabbing" aria-hidden>
              <GripVertical className="h-4 w-4" />
            </span>
            <span className="data text-xs text-moss">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-bark">{item.label}</p>
              {item.meta}
            </div>
          </div>
          {item.below ? <div className="border-t border-mist px-3 py-2">{item.below}</div> : null}
        </li>
      ))}
    </ul>
  );
}
