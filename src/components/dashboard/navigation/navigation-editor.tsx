"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResourceForm, type FieldDescriptor } from "@/components/dashboard/resource-form";
import { SortableList } from "@/components/dashboard/sortable-list";
import { navItemSchema, type NavItemInput } from "@/lib/validators/nav-item";
import {
  createNavItem,
  deleteNavItem,
  reorderNavItems,
  updateNavItem,
} from "@/server/actions/nav-item";
import type { ActionResult } from "@/server/actions/types";
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

function emptyForm(parentId: string | null = null): NavItemInput {
  return {
    label: "",
    labelUr: "",
    href: "",
    icon: "",
    target: "SELF",
    orderIndex: 0,
    isVisible: true,
    isMegaMenu: false,
    isDynamicRegions: false,
    parentId,
  };
}

function nodeToForm(node: NavTreeNode, parentId: string | null): NavItemInput {
  return {
    label: node.label,
    labelUr: node.labelUr,
    href: node.href,
    icon: node.icon,
    target: node.target,
    orderIndex: node.orderIndex,
    isVisible: node.isVisible,
    isMegaMenu: node.isMegaMenu,
    isDynamicRegions: node.isDynamicRegions,
    parentId,
  };
}

const fields: FieldDescriptor<NavItemInput>[] = [
  { name: "label", label: "Label", tab: "en" },
  { name: "labelUr", label: "Label (Urdu)", tab: "ur" },
  {
    name: "href",
    label: "Href",
    tab: "all",
    placeholder: "Leave empty for a dropdown trigger",
    description: "Null/empty href = dropdown only (no link).",
  },
  { name: "icon", label: "Icon (lucide name)", tab: "all", placeholder: "Map" },
  {
    name: "target",
    label: "Target",
    type: "select",
    options: [
      { label: "Same tab", value: "SELF" },
      { label: "New tab", value: "BLANK" },
    ],
    tab: "all",
  },
  {
    name: "isVisible",
    label: "Visible",
    type: "checkbox",
    placeholder: "Show in public navbar",
    tab: "all",
  },
  {
    name: "isMegaMenu",
    label: "Mega menu",
    type: "checkbox",
    placeholder: "Render as mega menu",
    tab: "all",
  },
  {
    name: "isDynamicRegions",
    label: "Dynamic regions",
    type: "checkbox",
    placeholder: "Fill children from published regions",
    tab: "all",
  },
  { name: "orderIndex", label: "Order", type: "number", tab: "all" },
];

type Props = { roots: NavTreeNode[] };

export function NavigationEditor({ roots }: Props) {
  const router = useRouter();
  const [tree, setTree] = useState(roots);
  const [dialog, setDialog] = useState<{
    id?: string;
    values: NavItemInput;
  } | null>(null);

  useEffect(() => {
    setTree(roots);
  }, [roots]);

  const refresh = () => router.refresh();

  const previewItems = useMemo(
    () =>
      tree
        .filter((n) => n.isVisible)
        .map((n) => ({
          id: n.id,
          label: n.label,
          href: n.href,
          isMegaMenu: n.isMegaMenu,
          children: n.isDynamicRegions
            ? [{ id: "dyn", label: "(published regions)", href: null as string | null }]
            : n.children
                .filter((c) => c.isVisible)
                .map((c) => ({ id: c.id, label: c.label, href: c.href })),
        })),
    [tree]
  );

  const openCreate = (parentId: string | null) => {
    setDialog({ values: emptyForm(parentId) });
  };

  const openEdit = (node: NavTreeNode, parentId: string | null) => {
    setDialog({ id: node.id, values: nodeToForm(node, parentId) });
  };

  const onDelete = async (node: NavTreeNode) => {
    if (!confirm(`Delete “${node.label}”?`)) return;
    const result = await deleteNavItem(node.id);
    if (result.ok) {
      toast.success("Deleted");
      refresh();
    } else toast.error(result.error);
  };

  const onReorderParents = async (input: {
    orderedIds: string[];
    parentId?: string | null;
  }): Promise<ActionResult> => {
    const byId = new Map(tree.map((n) => [n.id, n]));
    const next = input.orderedIds
      .map((id) => byId.get(id))
      .filter((n): n is NavTreeNode => Boolean(n));
    setTree(next);
    return reorderNavItems(input);
  };

  const onReorderChildren = async (input: {
    orderedIds: string[];
    parentId?: string | null;
  }): Promise<ActionResult> => {
    const parentId = input.parentId ?? null;
    if (!parentId) return { ok: false, error: "Missing parent" };
    setTree((prev) =>
      prev.map((p) => {
        if (p.id !== parentId) return p;
        const byId = new Map(p.children.map((c) => [c.id, c]));
        return {
          ...p,
          children: input.orderedIds
            .map((id) => byId.get(id))
            .filter((c): c is NavTreeNode => Boolean(c)),
        };
      })
    );
    return reorderNavItems(input);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-deodar px-3 text-sm font-medium text-paper"
            onClick={() => openCreate(null)}
          >
            <Plus className="h-4 w-4" /> Add top-level item
          </button>
        </div>

        <SortableList
          parentId={null}
          onReorder={onReorderParents}
          items={tree.map((parent) => ({
            id: parent.id,
            label: parent.label,
            meta: (
              <RowMeta
                node={parent}
                onEdit={() => openEdit(parent, null)}
                onAddChild={() => openCreate(parent.id)}
                onDelete={() => void onDelete(parent)}
              />
            ),
            below:
              parent.children.length > 0 ? (
                <SortableList
                  parentId={parent.id}
                  onReorder={onReorderChildren}
                  className="pl-2"
                  items={parent.children.map((child) => ({
                    id: child.id,
                    label: child.label,
                    meta: (
                      <RowMeta
                        node={child}
                        onEdit={() => openEdit(child, parent.id)}
                        onDelete={() => void onDelete(child)}
                      />
                    ),
                  }))}
                />
              ) : (
                <p className="px-1 py-1 text-xs text-moss">No children</p>
              ),
          }))}
        />
      </div>

      <aside className="h-fit rounded-[12px] border border-mist bg-paper p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-20">
        <p className="eyebrow mb-3 text-resin">Navbar preview</p>
        <nav aria-label="Preview" className="space-y-2">
          {previewItems.length === 0 ? (
            <p className="text-sm text-moss">No visible items</p>
          ) : (
            previewItems.map((item) => (
              <div key={item.id} className="border-b border-mist/70 pb-2 last:border-0">
                <p className="text-sm font-medium text-bark">
                  {item.label}
                  {!item.href && (
                    <span className="ml-2 font-mono text-[10px] uppercase text-moss">
                      dropdown
                    </span>
                  )}
                  {item.isMegaMenu && (
                    <span className="ml-1 font-mono text-[10px] uppercase text-resin">mega</span>
                  )}
                </p>
                {item.href && (
                  <p className="font-mono text-[11px] text-moss">{item.href}</p>
                )}
                {item.children.length > 0 && (
                  <ul className="mt-1 space-y-0.5 border-l border-mist pl-2">
                    {item.children.map((c) => (
                      <li key={c.id} className="text-xs text-bark/80">
                        {c.label}
                        {c.href ? (
                          <span className="ml-1 font-mono text-[10px] text-moss">{c.href}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </nav>
      </aside>

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-mist bg-paper text-bark sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {dialog?.id ? "Edit nav item" : "New nav item"}
            </DialogTitle>
          </DialogHeader>
          {dialog && (
            <ResourceForm
              key={`${dialog.id ?? "new"}-${dialog.values.parentId ?? "root"}`}
              schema={navItemSchema}
              fields={fields}
              defaultValues={dialog.values}
              showLanguageTabs
              submitLabel={dialog.id ? "Save item" : "Create item"}
              onCancel={() => setDialog(null)}
              onSubmit={async (values): Promise<ActionResult> => {
                const payload = {
                  ...values,
                  parentId: dialog.values.parentId ?? null,
                };
                const result = dialog.id
                  ? await updateNavItem(dialog.id, payload)
                  : await createNavItem(payload);
                if (result.ok) {
                  setDialog(null);
                  refresh();
                }
                return result;
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowMeta({
  node,
  onEdit,
  onAddChild,
  onDelete,
}: {
  node: NavTreeNode;
  onEdit: () => void;
  onAddChild?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "rounded-[8px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
          node.href ? "bg-mist text-moss" : "bg-resin/15 text-resin"
        )}
      >
        {node.href ?? "dropdown"}
      </span>
      {!node.isVisible && (
        <span className="rounded-[8px] bg-bark/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-moss">
          hidden
        </span>
      )}
      {node.isMegaMenu && (
        <span className="rounded-[8px] bg-deodar/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-deodar">
          mega
        </span>
      )}
      {node.isDynamicRegions && (
        <span className="rounded-[8px] bg-deodar/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-deodar">
          dynamic regions
        </span>
      )}
      <span className="ml-auto flex gap-1">
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-bark"
          aria-label="Edit"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {onAddChild && (
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-bark"
            aria-label="Add child"
            onClick={onAddChild}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          className="grid h-7 w-7 place-items-center rounded-[8px] text-moss hover:bg-mist hover:text-resin"
          aria-label="Delete"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  );
}
