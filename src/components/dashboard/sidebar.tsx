"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, TreePine } from "lucide-react";
import type { Role } from "@prisma/client";
import { filterNavForRole } from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

type Props = {
  role: Role;
};

export function DashboardSidebar({ role }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const groups = filterNavForRole(role);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-bark text-mist transition-[width] duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-deodar/50 px-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-deodar text-paper">
          <TreePine className="h-4 w-4" aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-paper">KP Forest</p>
            <p className="eyebrow truncate text-[10px] text-moss">Dashboard</p>
          </div>
        )}
      </div>

      <nav
        aria-label="Dashboard"
        className="sidebar-scroll flex-1 overflow-y-auto px-2 py-4"
      >
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="eyebrow mb-2 px-2 text-[10px] text-moss">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-deodar text-paper"
                          : "text-mist hover:bg-deodar/40 hover:text-paper"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-deodar/50 p-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] px-2 py-2 text-sm text-mist transition-colors hover:bg-deodar/40 hover:text-paper"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
