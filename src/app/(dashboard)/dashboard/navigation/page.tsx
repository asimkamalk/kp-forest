import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  NavTreeEditor,
  type NavTreeNode,
} from "@/components/dashboard/navigation/nav-tree";

export default async function NavigationDashboardPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const items = await prisma.navItem.findMany({
    where: { parentId: null },
    orderBy: { orderIndex: "asc" },
    include: {
      children: { orderBy: { orderIndex: "asc" } },
    },
  });

  const roots: NavTreeNode[] = items.map((item) => ({
    id: item.id,
    label: item.label,
    labelUr: item.labelUr,
    href: item.href,
    icon: item.icon,
    target: item.target,
    isVisible: item.isVisible,
    isMegaMenu: item.isMegaMenu,
    isDynamicRegions: item.isDynamicRegions,
    orderIndex: item.orderIndex,
    children: item.children.map((child) => ({
      id: child.id,
      label: child.label,
      labelUr: child.labelUr,
      href: child.href,
      icon: child.icon,
      target: child.target,
      isVisible: child.isVisible,
      isMegaMenu: child.isMegaMenu,
      isDynamicRegions: child.isDynamicRegions,
      orderIndex: child.orderIndex,
      children: [],
    })),
  }));

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <div>
        <p className="eyebrow text-resin">Content</p>
        <h1 className="mt-1 font-display text-2xl text-bark">Navigation</h1>
        <p className="mt-1 text-sm text-moss">
          Drag to reorder. Parents with children warn before delete.
        </p>
      </div>
      <NavTreeEditor roots={roots} />
    </div>
  );
}
