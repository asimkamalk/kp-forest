"use client";

import { StatusBadge } from "@/components/dashboard/data-table";
import { SortableList } from "@/components/dashboard/sortable-list";
import { reorderStatCounters } from "@/server/actions/stat";

type Item = {
  id: string;
  label: string;
  status: string;
};

export function StatsReorderList({ items }: { items: Item[] }) {
  return (
    <SortableList
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        meta: <StatusBadge status={item.status} />,
      }))}
      onReorder={reorderStatCounters}
    />
  );
}
