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
import { ChevronRight, Sun, Moon, Monitor, Languages } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { UserRole } from "@/types/onboarding";
import { useThemeStore, type Theme } from "@/stores/theme-store";
import { useI18nStore, type Locale } from "@/lib/i18n";
import { useT } from "@/lib/i18n/use-translation";
import { CommandPalette } from "./command-palette";
import { NotificationCenter } from "./notification-center";

const ROLES: UserRole[] = ["pm", "compliance", "tech_lead", "admin"];

const ROUTE_KEY_MAP: Record<string, string> = {
  dashboard: "route_dashboard",
  onboarding: "nav_onboarding",
  workspace: "route_workspace",
  admin: "route_admin",
  templates: "nav_templates",
  integrations: "nav_integrations",
  audit: "nav_audit",
  new: "route_new",
  settings: "nav_settings",
  users: "nav_users",
  analytics: "nav_analytics",
};

const THEME_ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const LOCALES: { value: Locale; flag: string; labelKey: "header_lang_en" | "header_lang_id" }[] = [
  { value: "en", flag: "🇬🇧", labelKey: "header_lang_en" },
  { value: "id", flag: "🇮🇩", labelKey: "header_lang_id" },
];

function useBreadcrumbs() {
  const pathname = usePathname();
  const requests = useOnboardingStore((s) => s.requests);
  const t = useT();
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
      const routeKey = ROUTE_KEY_MAP[seg];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const label = routeKey ? t(routeKey as any) : seg;
      crumbs.push({ label, href: path });
    }
  }

  return crumbs;
}

export function Header() {
  const { currentUser, switchRole } = useAuthStore();
  const breadcrumbs = useBreadcrumbs();
  const { theme, setTheme } = useThemeStore();
  const { locale, setLocale } = useI18nStore();
  const t = useT();

  const ThemeIcon = THEME_ICONS[theme];

  const THEMES: { value: Theme; labelKey: "header_theme_light" | "header_theme_dark" | "header_theme_system" }[] = [
    { value: "light", labelKey: "header_theme_light" },
    { value: "dark", labelKey: "header_theme_dark" },
    { value: "system", labelKey: "header_theme_system" },
  ];

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

      <div className="flex items-center gap-2">
        {/* Command Palette Search */}
        <CommandPalette />

        {/* Notifications */}
        <NotificationCenter />

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Languages className="h-4 w-4" />
              <span className="font-medium">{locale.toUpperCase()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Language</DropdownMenuLabel>
            {LOCALES.map(({ value, flag, labelKey }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setLocale(value)}
                className={locale === value ? "bg-muted" : ""}
              >
                <span className="mr-2">{flag}</span>
                {t(labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <ThemeIcon className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t(`header_theme_${theme}` as "header_theme_light" | "header_theme_dark" | "header_theme_system")}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-40">
            {THEMES.map(({ value, labelKey }) => {
              const Icon = THEME_ICONS[value];
              return (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setTheme(value)}
                  className={theme === value ? "bg-muted" : ""}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {t(labelKey)}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Role Badge + User Menu */}
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
              {t("header_switch_role")}
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
