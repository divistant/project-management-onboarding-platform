import type { UserRole, OnboardingStatus } from "@/types/onboarding";
import type { TranslationKey } from "@/lib/i18n/translations/en";

export const ROLE_LABELS: Record<UserRole, string> = {
  pm: "Project Manager",
  compliance: "Compliance Officer",
  tech_lead: "Tech Lead",
  admin: "Admin",
};

export const STATUS_CONFIG: Record<
  OnboardingStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  PROCESSING: { label: "Processing", variant: "outline" },
  REVIEW: { label: "In Review", variant: "default" },
  GATE_PENDING: { label: "Awaiting Gate", variant: "outline" },
  READY_TO_GENERATE: { label: "Ready", variant: "default" },
  GENERATED: { label: "Generated", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
};

const ALL_ROLES: UserRole[] = ["pm", "compliance", "tech_lead", "admin"];

export interface NavItem {
  label: string;
  labelKey: TranslationKey;
  href: string;
  icon: string;
  roles: UserRole[];
}

export interface NavGroup {
  label: string;
  labelKey: TranslationKey;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "WORKSPACE",
    labelKey: "nav_group_workspace",
    items: [
      {
        label: "Dashboard",
        labelKey: "nav_dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        roles: ALL_ROLES,
      },
      {
        label: "Analytics",
        labelKey: "nav_analytics",
        href: "/analytics",
        icon: "PieChart",
        roles: ALL_ROLES,
      },
      {
        label: "Onboarding Project",
        labelKey: "nav_onboarding",
        href: "/onboarding",
        icon: "FolderKanban",
        roles: ALL_ROLES,
      },
      {
        label: "Template & Standard",
        labelKey: "nav_templates",
        href: "/admin/templates",
        icon: "BookOpen",
        roles: ALL_ROLES,
      },
    ],
  },
  {
    label: "ADMIN",
    labelKey: "nav_group_admin",
    items: [
      {
        label: "Settings",
        labelKey: "nav_settings",
        href: "/admin/settings",
        icon: "Settings",
        roles: ["admin"],
      },
      {
        label: "User",
        labelKey: "nav_users",
        href: "/admin/users",
        icon: "Users",
        roles: ["admin"],
      },
      {
        label: "Audit Log",
        labelKey: "nav_audit",
        href: "/audit",
        icon: "ScrollText",
        roles: ALL_ROLES,
      },
    ],
  },
];

// Legacy flat list kept for any existing consumers
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
