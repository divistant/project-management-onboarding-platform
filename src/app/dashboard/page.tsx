"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  ShieldCheck,
  Rocket,
  Inbox,
  Plus,
  ArrowUpRight,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Eye,
  TrendingUp,
  Users as UsersIcon,
  Activity,
  Plug,
  Webhook,
  KeyRound,
  Shield,
  Bot,
  AlertCircle
} from "lucide-react";
import type { OnboardingStatus } from "@/types/onboarding";
import { useT } from "@/lib/i18n/use-translation";
import { useI18nStore } from "@/lib/i18n";
import { USERS } from "@/mocks/seed-data";

const ACTION_ICONS: Record<string, typeof FileText> = {
  create: Plus,
  upload: Upload,
  approve: CheckCircle2,
  reject: AlertTriangle,
  generate: GitBranch,
  review: Eye,
  edit: FileText,
};

function getActionIcon(action: string) {
  const key = Object.keys(ACTION_ICONS).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_ICONS[key] : Clock;
}

function getActionColor(action: string): string {
  if (action.includes("approve")) return "text-green-600 bg-green-100 dark:bg-green-900/40";
  if (action.includes("reject") || action.includes("changes")) return "text-red-600 bg-red-100 dark:bg-red-900/40";
  if (action.includes("generate")) return "text-violet-600 bg-violet-100 dark:bg-violet-900/40";
  if (action.includes("upload")) return "text-blue-600 bg-blue-100 dark:bg-blue-900/40";
  if (action.includes("create")) return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40";
  return "text-muted-foreground bg-muted";
}

function timeAgo(timestamp: string, t: ReturnType<typeof useT>): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("common_just_now");
  if (minutes < 60) return `${minutes}${t("common_minutes")} ${t("common_ago")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t("common_hours")} ${t("common_ago")}`;
  const days = Math.floor(hours / 24);
  return `${days}${t("common_days")} ${t("common_ago")}`;
}

export default function DashboardPage() {
  const requests = useOnboardingStore((s) => s.requests);
  const currentUser = useAuthStore((s) => s.currentUser);
  const t = useT();
  const { locale } = useI18nStore();

  const activeRequests = requests.filter((r) => !r.archived);
  const totalRequests = activeRequests.length;
  const inReview = activeRequests.filter((r) => r.status === "REVIEW").length;
  const awaitingGate = activeRequests.filter((r) => r.status === "GATE_PENDING").length;
  const generated = activeRequests.filter((r) => r.status === "GENERATED").length;
  const processing = activeRequests.filter((r) => r.status === "PROCESSING").length;
  const draft = activeRequests.filter((r) => r.status === "DRAFT").length;
  const readyToGenerate = activeRequests.filter((r) => r.status === "READY_TO_GENERATE").length;
  const failed = activeRequests.filter((r) => r.status === "FAILED").length;

  const pendingActions = inReview + awaitingGate;
  const activeUsersCount = USERS.filter(u => u.status === "active").length;

  const allAuditEvents = requests
    .flatMap((r) => r.auditLog)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  const recentRequests = [...activeRequests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const statusDistribution = [
    { label: t("status_draft"), count: draft, color: "bg-slate-400" },
    { label: t("status_processing"), count: processing, color: "bg-blue-500" },
    { label: t("status_review"), count: inReview, color: "bg-amber-500" },
    { label: t("status_gate_pending"), count: awaitingGate, color: "bg-purple-500" },
    { label: t("status_ready"), count: readyToGenerate, color: "bg-cyan-500" },
    { label: t("status_generated"), count: generated, color: "bg-green-500" },
    { label: t("status_failed"), count: failed, color: "bg-red-500" },
  ].filter((s) => s.count > 0);

  const kpiCards = [
    {
      title: "Total Requests", // Hardcoded English fallback if translation missing, but using t() where possible. Assuming we just use English for new metrics for now if no translation keys exist, but let's use t() for old ones and raw strings for new ones mapped
      value: totalRequests,
      icon: ClipboardList,
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600",
      desc: t("dash_kpi_total_desc"),
    },
    {
      title: "Pending Actions",
      value: pendingActions,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-600",
      desc: "Requires review or approval",
    },
    {
      title: "Active Users",
      value: activeUsersCount,
      icon: UsersIcon,
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-600",
      desc: "Currently active on platform",
    },
    {
      title: "System Health",
      value: "98%",
      icon: Activity,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-600",
      desc: "All services operational",
    },
  ];

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? t("dash_greeting_morning")
      : today.getHours() < 17
        ? t("dash_greeting_afternoon")
        : t("dash_greeting_evening");

  const dateStr = today.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function getRequestProgress(status: OnboardingStatus): number {
    const map: Record<OnboardingStatus, number> = {
      DRAFT: 10,
      PROCESSING: 30,
      REVIEW: 50,
      GATE_PENDING: 70,
      READY_TO_GENERATE: 85,
      GENERATED: 100,
      FAILED: 0,
    };
    return map[status] || 0;
  }

  // Mock system integration health
  const integrations = [
    { name: "GitLab", status: "operational", icon: Plug },
    { name: "LLM API", status: "operational", icon: Bot },
    { name: "Webhooks", status: "operational", icon: Webhook, extra: "3 Active" },
    { name: "Jira", status: "degraded", icon: Plug, extra: "Disconnected" },
  ];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header with greeting */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {greeting}, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {dateStr}
              {" · "}{totalRequests} {totalRequests !== 1 ? t("dash_active_requests_plural") : t("dash_active_requests")}
            </p>
          </div>
          {(currentUser.role === "pm" || currentUser.role === "admin") && (
            <Link href="/onboarding/new">
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                {t("dash_new_onboarding")}
              </Button>
            </Link>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title} className="gap-0 py-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.iconBg}`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{kpi.title}</p>
                    <p className="text-2xl font-bold leading-none mt-0.5">{kpi.value}</p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{kpi.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Health & Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* System Health Panel */}
          <Card className="gap-0 py-0">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {integrations.map((integration) => (
                  <div key={integration.name} className="flex items-center gap-3 rounded-md border p-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${integration.status === 'operational' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                      <integration.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate">{integration.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2 shrink-0">
                          {integration.status === 'operational' ? (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-500"></span>
                          ) : (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500"></span>
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {integration.extra || (integration.status === 'operational' ? 'Operational' : 'Degraded')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Quick Actions */}
          <Card className="gap-0 py-0">
            <CardHeader className="pt-4 pb-2 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Admin Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start h-auto py-2.5 px-3">
                    <UsersIcon className="h-4 w-4 mr-2.5 text-blue-500" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-semibold">User Management</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Invite & manage roles</span>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start h-auto py-2.5 px-3">
                    <Plug className="h-4 w-4 mr-2.5 text-violet-500" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-semibold">PM Tools</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Configure Git & Jira</span>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start h-auto py-2.5 px-3">
                    <KeyRound className="h-4 w-4 mr-2.5 text-amber-500" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-semibold">API Keys</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Manage access tokens</span>
                    </div>
                  </Button>
                </Link>
                <Link href="/audit">
                  <Button variant="outline" className="w-full justify-start h-auto py-2.5 px-3">
                    <ScrollArea className="h-4 w-4 mr-2.5 text-rose-500" /> {/* Reusing ScrollArea as an icon placeholder is bad, fixing down to ScrollText */}
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-xs font-semibold">Audit Logs</span>
                      <span className="text-[10px] text-muted-foreground font-normal">View system activity</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution Bar */}
        {totalRequests > 0 && (
          <Card className="gap-0 py-0">
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("dash_status_distribution")}</span>
                </div>
                <span className="text-xs text-muted-foreground">{totalRequests} {t("dash_total")}</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                {statusDistribution.map((s) => (
                  <div
                    key={s.label}
                    className={`${s.color} transition-all`}
                    style={{ width: `${(s.count / totalRequests) * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {statusDistribution.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-[11px] text-muted-foreground">
                      {s.label} <span className="font-medium text-foreground">{s.count}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Recent Requests — 3 cols */}
          <Card className="lg:col-span-3 gap-0 py-0">
            <CardHeader className="pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t("dash_recent_requests")}</CardTitle>
                <Link href="/onboarding">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    {t("dash_view_all")} <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {recentRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                  <Inbox className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">{t("dash_no_requests")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dash_no_requests_desc")}</p>
                  <Link href="/onboarding/new">
                    <Button size="sm" className="mt-3">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> {t("dash_create_onboarding")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRequests.map((req) => {
                    const statusCfg = STATUS_CONFIG[req.status as OnboardingStatus];
                    const progress = getRequestProgress(req.status as OnboardingStatus);
                    return (
                      <Link key={req.id} href={`/workspace/${req.id}`} className="block">
                        <div className="group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate group-hover:underline">{req.name}</span>
                              <Badge variant={statusCfg.variant} className="text-[10px] shrink-0">{statusCfg.label}</Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span>{req.owner}</span>
                              <span>·</span>
                              <span>{req.org}</span>
                              <span>·</span>
                              <span>{timeAgo(req.updatedAt, t)}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 shrink-0 w-28">
                            <Progress value={progress} className="h-1.5 flex-1" />
                            <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">{progress}%</span>
                          </div>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed — 2 cols */}
          <Card className="lg:col-span-2 gap-0 py-0">
            <CardHeader className="pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t("dash_activity_feed")}</CardTitle>
                <Link href="/audit">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    {t("dash_view_all")} <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {allAuditEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                  <Clock className="mb-2 h-6 w-6 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">{t("dash_no_activity")}</p>
                </div>
              ) : (
                <ScrollArea className="h-[360px]">
                  <div className="space-y-1">
                    {allAuditEvents.map((event) => {
                      const Icon = getActionIcon(event.action);
                      const colorClasses = getActionColor(event.action);
                      return (
                        <div key={event.id} className="flex gap-2.5 rounded-md px-2 py-2 hover:bg-muted/50 transition-colors">
                          <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${colorClasses}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-relaxed">
                              <span className="font-medium">{event.userName}</span>{" "}
                              <span className="text-muted-foreground">{event.detail}</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(event.timestamp, t)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
