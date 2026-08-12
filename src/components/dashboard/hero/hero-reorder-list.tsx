"use client";

import { StatusBadge } from "@/components/dashboard/data-table";
import { SortableList } from "@/components/dashboard/sortable-list";
import { reorderHeroSlides } from "@/server/actions/hero";

type Item = {
  id: string;
  label: string;
  status: string;
};

/** Client wrapper so the server page never passes inline handlers or element props. */
export function HeroReorderList({ items }: { items: Item[] }) {
  return (
    <SortableList
      items={items.map((item) => ({
        id: item.id,
        label: item.label,
        meta: <StatusBadge status={item.status} />,
      }))}
      onReorder={reorderHeroSlides}
    />
  );
}
