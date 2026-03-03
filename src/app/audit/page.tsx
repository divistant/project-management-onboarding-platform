"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ScrollText,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Eye,
  Clock,
  Plus,
  Pencil,
  X,
  Download,
  Inbox,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

const ACTION_ICONS: Record<string, typeof FileText> = {
  create: Plus,
  upload: Upload,
  approve: CheckCircle2,
  reject: AlertTriangle,
  generate: GitBranch,
  review: Eye,
  edit: Pencil,
  submit: Upload,
  process: Clock,
  archive: Download,
};

function getActionIcon(action: string) {
  const key = Object.keys(ACTION_ICONS).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_ICONS[key] : Clock;
}

function getActionColor(action: string): string {
  if (action.includes("approve")) return "text-green-600 bg-green-100 dark:bg-green-900/40";
  if (action.includes("reject") || action.includes("changes")) return "text-red-600 bg-red-100 dark:bg-red-900/40";
  if (action.includes("generate")) return "text-violet-600 bg-violet-100 dark:bg-violet-900/40";
  if (action.includes("upload") || action.includes("submit")) return "text-blue-600 bg-blue-100 dark:bg-blue-900/40";
  if (action.includes("create")) return "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40";
  if (action.includes("edit")) return "text-amber-600 bg-amber-100 dark:bg-amber-900/40";
  return "text-muted-foreground bg-muted";
}

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  if (action.includes("approve")) return "default";
  if (action.includes("reject") || action.includes("changes")) return "destructive";
  if (action.includes("generate")) return "default";
  if (action.includes("create")) return "default";
  return "secondary";
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function AuditLogPage() {
  const requests = useOnboardingStore((s) => s.requests);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const allEvents = useMemo(() => {
    return requests
      .flatMap((r) =>
        r.auditLog.map((e) => ({
          ...e,
          requestName: r.name,
          requestId: r.id,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [requests]);

  const uniqueActions = useMemo(() => Array.from(new Set(allEvents.map((e) => e.action))).sort(), [allEvents]);
  const uniqueUsers = useMemo(() => Array.from(new Set(allEvents.map((e) => e.userName))).sort(), [allEvents]);
  const uniqueProjects = useMemo(() => Array.from(new Set(allEvents.map((e) => e.requestName))).sort(), [allEvents]);

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      const matchSearch = !search ||
        e.detail.toLowerCase().includes(search.toLowerCase()) ||
        e.userName.toLowerCase().includes(search.toLowerCase()) ||
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.requestName.toLowerCase().includes(search.toLowerCase());
      const matchAction = actionFilter === "all" || e.action === actionFilter;
      const matchUser = userFilter === "all" || e.userName === userFilter;
      const matchProject = projectFilter === "all" || e.requestName === projectFilter;
      return matchSearch && matchAction && matchUser && matchProject;
    });
  }, [allEvents, search, actionFilter, userFilter, projectFilter]);

  const hasActiveFilters = search || actionFilter !== "all" || userFilter !== "all" || projectFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setActionFilter("all");
    setUserFilter("all");
    setProjectFilter("all");
  };

  const actionCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of allEvents) {
      map[e.action] = (map[e.action] || 0) + 1;
    }
    return map;
  }, [allEvents]);

  const topActions = Object.entries(actionCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Track all events across onboarding requests — uploads, edits, approvals, and generations
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ScrollText className="h-4 w-4" />
            <span><span className="font-medium text-foreground">{allEvents.length}</span> total events</span>
          </div>
        </div>

        {/* Stats: top actions */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {topActions.map(([action, count]) => {
            const Icon = getActionIcon(action);
            const colorClasses = getActionColor(action);
            const isActive = actionFilter === action;
            return (
              <button
                key={action}
                onClick={() => setActionFilter(isActive ? "all" : action)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors shrink-0 ${
                  isActive ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${colorClasses}`}>
                  <Icon className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[11px] capitalize text-muted-foreground">{action}</p>
                  <p className="text-sm font-semibold leading-none">{count}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {allEvents.length} events
          {hasActiveFilters && " (filtered)"}
        </p>

        {/* Event list */}
        <Card className="gap-0 py-0">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-sm font-medium">No events found</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasActiveFilters ? "Try adjusting your filters or search" : "Events will appear here as users take actions"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[520px]">
                <div className="divide-y">
                  {filtered.map((event) => {
                    const Icon = getActionIcon(event.action);
                    const colorClasses = getActionColor(event.action);
                    const badgeVariant = getActionBadgeVariant(event.action);
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                      >
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${colorClasses}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={badgeVariant} className="text-[10px] capitalize shrink-0">
                              {event.action}
                            </Badge>
                            <Link href={`/workspace/${event.requestId}`} className="text-[11px] text-primary hover:underline truncate">
                              {event.requestName}
                            </Link>
                          </div>
                          <p className="mt-0.5 text-sm leading-relaxed">{event.detail}</p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-medium">{event.userName}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{timeAgo(event.timestamp)}</span>
                          </div>
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
    </AppLayout>
  );
}
