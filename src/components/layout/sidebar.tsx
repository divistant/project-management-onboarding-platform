"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Settings,
  Users,
  Plug,
  ScrollText,
  ChevronUp,
  User,
  LogOut,
  Circle,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useT } from "@/lib/i18n/use-translation";
import type { TranslationKey } from "@/lib/i18n/translations/en";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Settings,
  Users,
  Plug,
  ScrollText,
  PieChart,
};

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useAuthStore();
  const t = useT();

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
          AI
        </div>
        <span className="font-semibold text-sm tracking-tight">AI-DLC</span>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(currentUser.role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {/* Section Label */}
              <p className="mb-1 px-2 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
                {t(group.labelKey as TranslationKey)}
              </p>

              {/* Items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{t(item.labelKey as TranslationKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile Card */}
      <div className="border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors outline-none">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium leading-tight truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">
                  {currentUser.role === "admin"
                    ? "Admin"
                    : currentUser.role === "pm"
                      ? "Project Manager"
                      : currentUser.role === "compliance"
                        ? "Compliance Officer"
                        : "Tech Lead"}
                </p>
              </div>
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={4}
            className="w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              {t("sidebar_profile")}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" />
                {t("sidebar_settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              {t("sidebar_logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 pb-3 -mt-1">
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
            <span className="text-[10px] text-muted-foreground">{t("sidebar_healthy")}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{t("sidebar_version")}</span>
        </div>
      </div>
    </aside>
  );
}
