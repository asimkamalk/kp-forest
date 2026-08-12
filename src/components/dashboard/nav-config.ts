import { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Download,
  FileText,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  Map,
  MessageSquare,
  Navigation,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[] | "all";
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

const ALL: Role[] = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
  Role.EDITOR,
  Role.VIEWER,
];

const CONTENT: Role[] = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
  Role.EDITOR,
];

const ORG: Role[] = [
  Role.SUPER_ADMIN,
  Role.REGION_ADMIN,
  Role.CIRCLE_ADMIN,
  Role.DIVISION_ADMIN,
];

/** Users & Settings — DIVISION_ADMIN never included. */
const SUPER_ONLY: Role[] = [Role.SUPER_ADMIN];

const AUDIT: Role[] = [Role.SUPER_ADMIN, Role.REGION_ADMIN];

export const dashboardNav: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: "all",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Navigation", href: "/dashboard/navigation", icon: Navigation, roles: CONTENT },
      { label: "Hero Slides", href: "/dashboard/hero", icon: ImageIcon, roles: CONTENT },
      { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, roles: CONTENT },
      { label: "Pages", href: "/dashboard/pages", icon: FileText, roles: CONTENT },
    ],
  },
  {
    label: "Organisation",
    items: [
      { label: "Regions", href: "/dashboard/regions", icon: Map, roles: ORG },
      { label: "Circles", href: "/dashboard/circles", icon: Map, roles: ORG },
      { label: "Divisions", href: "/dashboard/divisions", icon: Map, roles: ORG },
    ],
  },
  {
    label: "Projects",
    items: [
      { label: "Projects", href: "/dashboard/projects", icon: FolderKanban, roles: CONTENT },
    ],
  },
  {
    label: "Downloads",
    items: [
      { label: "Downloads", href: "/dashboard/downloads", icon: Download, roles: CONTENT },
    ],
  },
  {
    label: "Media Gallery",
    items: [
      { label: "Media Gallery", href: "/dashboard/media", icon: ImageIcon, roles: CONTENT },
    ],
  },
  {
    label: "Requests & Complaints",
    items: [
      {
        label: "Requests & Complaints",
        href: "/dashboard/requests",
        icon: ClipboardList,
        roles: ORG,
      },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "Users", href: "/dashboard/users", icon: Users, roles: SUPER_ONLY },
    ],
  },
  {
    label: "Audit Log",
    items: [
      { label: "Audit Log", href: "/dashboard/audit", icon: Shield, roles: AUDIT },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: SUPER_ONLY },
    ],
  },
];

export function filterNavForRole(role: Role): DashboardNavGroup[] {
  return dashboardNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.roles === "all" ? ALL.includes(role) : item.roles.includes(role)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
