"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ROLE_LABELS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { UserRole } from "@/types/onboarding";

const ROLES: UserRole[] = ["pm", "compliance", "tech_lead", "admin"];

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  onboarding: "Onboarding Requests",
  workspace: "Workspace",
  admin: "Admin",
  templates: "Templates & Standards",
  integrations: "Integrations",
  audit: "Audit Log",
  new: "New Onboarding",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const requests = useOnboardingStore((s) => s.requests);
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [];
  let path = "";

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    path += `/${seg}`;

    if (segments[i - 1] === "workspace" && seg.startsWith("onb-")) {
      const req = requests.find((r) => r.id === seg);
      crumbs.push({ label: req?.name || seg, href: path });
    } else {
      const label = ROUTE_LABELS[seg] || seg;
      crumbs.push({ label, href: path });
    }
  }

  return crumbs;
}

export function Header() {
  const { currentUser, switchRole } = useAuthStore();
  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            {i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          {ROLE_LABELS[currentUser.role]}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Role (Demo)
            </DropdownMenuLabel>
            {ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => switchRole(role)}
                className={currentUser.role === role ? "bg-muted" : ""}
              >
                {ROLE_LABELS[role]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
