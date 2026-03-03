import type { UserRole, OnboardingStatus } from "@/types/onboarding";

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

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["pm", "compliance", "tech_lead", "admin"] as UserRole[] },
  { label: "Onboarding Requests", href: "/onboarding", icon: "ClipboardList", roles: ["pm", "compliance", "tech_lead", "admin"] as UserRole[] },
  { label: "Templates & Standards", href: "/admin/templates", icon: "FileText", roles: ["admin"] as UserRole[] },
  { label: "Integrations", href: "/admin/integrations", icon: "Plug", roles: ["admin"] as UserRole[] },
  { label: "Audit Log", href: "/audit", icon: "ScrollText", roles: ["pm", "compliance", "tech_lead", "admin"] as UserRole[] },
];
