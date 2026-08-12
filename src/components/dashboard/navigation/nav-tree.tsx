"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createNavItem,
  deleteNavItem,
  reorderNavItems,
  updateNavItem,
} from "@/server/actions/nav";
import type { NavItemInput } from "@/lib/validators/nav";
import { cn } from "@/lib/utils";

export type NavTreeNode = {
  id: string;
  label: string;
  labelUr: string | null;
  href: string | null;
  icon: string | null;
  target: "SELF" | "BLANK";
  isVisible: boolean;
  isMegaMenu: boolean;
  isDynamicRegions: boolean;
  orderIndex: number;
  children: NavTreeNode[];
};

const emptyForm = (parentId: string | null = null): NavItemInput => ({
  label: "",
  labelUr: "",
  href: "",
  icon: "",
  target: "SELF",
  isVisible: true,
  isMegaMenu: false,
  isDynamicRegions: false,
  parentId,
  orderIndex: 0,
});

type Props = { roots: NavTreeNode[] };

export function NavTreeEditor({ roots }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [parents, setParents] = useState(roots);
  const [editing, setEditing] = useState<{
    id?: string;
    values: NavItemInput;
  } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragParentId, setDragParentId] = useState<string | null>(null);

  useEffect(() => {
    setParents(roots);
  }, [roots]);

  const refresh = () => {
    router.refresh();
  };

  const save = () => {
    if (!editing) return;
    startTransition(async () => {
      const result = editing.id
        ? await updateNavItem(editing.id, editing.values)
        : await createNavItem(editing.values);
      if (result.ok) {
        toast.success(editing.id ? "Saved" : "Created");
        setEditing(null);
        refresh();
      } else toast.error(result.error);
    });
  };

  const remove = async (node: NavTreeNode, isParent: boolean) => {
    if (isParent && node.children.length > 0) {
      const ok = confirm(
        `"${node.label}" has ${node.children.length} child item(s). Deleting it will also remove its children. Continue?`
      );
      if (!ok) return;
    } else if (!confirm(`Delete "${node.label}"?`)) {
      return;
    }
    const result = await deleteNavItem(node.id);
    if (result.ok) {
      toast.success("Deleted");
      refresh();
    } else toast.error(result.error);
  };

  const persistOrder = async (orderedIds: string[], parentId: string | null) => {
    const result = await reorderNavItems({ orderedIds, parentId });
    if (result.ok) toast.success("Order updated");
    else toast.error(result.error);
    refresh();
  };

  const reorderList = <T extends { id: string }>(
    list: T[],
    fromId: string,
    toId: string
  ): T[] | null => {
    const from = list.findIndex((i) => i.id === fromId);
    const to = list.findIndex((i) => i.id === toId);
    if (from < 0 || to < 0 || from === to) return null;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-deodar px-3 text-sm font-medium text-paper"
          onClick={() => setEditing({ values: emptyForm(null) })}
        >
          <Plus className="h-4 w-4" /> Top-level item
        </button>
      </div>

      <ul className="space-y-3">
        {parents.map((parent, pIndex) => (
          <li
            key={parent.id}
            className="rounded-[12px] border border-mist bg-paper p-3 shadow-[var(--shadow-card)]"
            draggable
            onDragStart={() => {
              setDragId(parent.id);
              setDragParentId(null);
            }}
            onDragEnd={() => {
              setDragId(null);
              setDragParentId(null);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (!dragId || dragParentId !== null || dragId === parent.id) return;
              const next = reorderList(parents, dragId, parent.id);
              if (!next) return;
              setParents(next);
              void persistOrder(
                next.map((n) => n.id),
                null
              );
            }}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="mt-1 h-4 w-4 cursor-grab text-moss" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-bark">
                  {pIndex + 1}. {parent.label}
                  {!parent.isVisible && (
                    <span className="ml-2 font-mono text-[10px] uppercase text-moss">hidden</span>
                  )}
                </p>
                <p className="text-xs text-moss">
                  {parent.href || "Dropdown"}
                  {parent.isMegaMenu ? " · mega" : ""}
                  {parent.isDynamicRegions ? " · dynamic regions" : ""}
                </p>
              </div>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-bark"
                aria-label="Edit"
                onClick={() =>
                  setEditing({
                    id: parent.id,
                    values: {
                      label: parent.label,
                      labelUr: parent.labelUr,
                      href: parent.href,
                      icon: parent.icon,
                      target: parent.target,
                      isVisible: parent.isVisible,
                      isMegaMenu: parent.isMegaMenu,
                      isDynamicRegions: parent.isDynamicRegions,
                      parentId: null,
                      orderIndex: parent.orderIndex,
                    },
                  })
                }
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-bark"
                aria-label="Add child"
                onClick={() => setEditing({ values: emptyForm(parent.id) })}
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-resin"
                aria-label="Delete"
                onClick={() => void remove(parent, true)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {parent.children.length > 0 && (
              <ul className="mt-3 space-y-2 border-l border-mist pl-4">
                {parent.children.map((child, cIndex) => (
                  <li
                    key={child.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDragId(child.id);
                      setDragParentId(parent.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragParentId(null);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.stopPropagation();
                      if (!dragId || dragParentId !== parent.id || dragId === child.id) return;
                      const nextChildren = reorderList(parent.children, dragId, child.id);
                      if (!nextChildren) return;
                      setParents((prev) =>
                        prev.map((p) =>
                          p.id === parent.id ? { ...p, children: nextChildren } : p
                        )
                      );
                      void persistOrder(
                        nextChildren.map((n) => n.id),
                        parent.id
                      );
                    }}
                    className={cn(
                      "flex items-start gap-2 rounded-[8px] border border-mist/80 bg-mist/20 px-2 py-2",
                      dragId === child.id && "opacity-60"
                    )}
                  >
                    <GripVertical className="mt-0.5 h-4 w-4 cursor-grab text-moss" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-bark">
                        {cIndex + 1}. {child.label}
                      </p>
                      <p className="text-xs text-moss">{child.href || "—"}</p>
                    </div>
                    <button
                      type="button"
                      className="grid h-7 w-7 place-items-center rounded-[8px] text-moss hover:bg-paper"
                      aria-label="Edit child"
                      onClick={() =>
                        setEditing({
                          id: child.id,
                          values: {
                            label: child.label,
                            labelUr: child.labelUr,
                            href: child.href,
                            icon: child.icon,
                            target: child.target,
                            isVisible: child.isVisible,
                            isMegaMenu: child.isMegaMenu,
                            isDynamicRegions: child.isDynamicRegions,
                            parentId: parent.id,
                            orderIndex: child.orderIndex,
                          },
                        })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="grid h-7 w-7 place-items-center rounded-[8px] text-moss hover:text-resin"
                      aria-label="Delete child"
                      onClick={() => void remove(child, false)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-bark/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nav-edit-title"
            className="w-full max-w-lg rounded-[12px] border border-mist bg-paper p-5 shadow-[var(--shadow-card)]"
          >
            <h2 id="nav-edit-title" className="font-display text-xl text-bark">
              {editing.id ? "Edit nav item" : "New nav item"}
            </h2>
            <div className="mt-4 grid gap-3">
              <Field
                label="Label"
                value={editing.values.label}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, label: v } })
                }
              />
              <Field
                label="Label (Urdu)"
                value={editing.values.labelUr ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, labelUr: v } })
                }
              />
              <Field
                label="Href"
                value={editing.values.href ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, href: v } })
                }
                placeholder="/about"
              />
              <Field
                label="Icon (lucide name)"
                value={editing.values.icon ?? ""}
                onChange={(v) =>
                  setEditing({ ...editing, values: { ...editing.values, icon: v } })
                }
                placeholder="Map"
              />
              <label className="text-sm text-bark">
                Target
                <select
                  className="mt-1 h-10 w-full rounded-[8px] border border-mist bg-paper px-3"
                  value={editing.values.target}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      values: {
                        ...editing.values,
                        target: e.target.value as "SELF" | "BLANK",
                      },
                    })
                  }
                >
                  <option value="SELF">Same tab</option>
                  <option value="BLANK">New tab</option>
                </select>
              </label>
              {(
                [
                  ["isVisible", "Visible"],
                  ["isMegaMenu", "Mega menu"],
                  ["isDynamicRegions", "Dynamic regions"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-bark">
                  <input
                    type="checkbox"
                    className="accent-deodar"
                    checked={Boolean(editing.values[key])}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        values: { ...editing.values, [key]: e.target.checked },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="h-9 rounded-[8px] border border-mist px-4 text-sm"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                className="h-9 rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper disabled:opacity-60"
                onClick={save}
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-bark">
      {label}
      <input
        className="mt-1 h-10 w-full rounded-[8px] border border-mist bg-paper px-3 text-sm outline-none focus-visible:border-resin focus-visible:ring-2 focus-visible:ring-resin/30"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
