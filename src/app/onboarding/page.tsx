"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_CONFIG } from "@/lib/constants";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Copy,
  Archive,
  Inbox,
  FileText,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { OnboardingStatus } from "@/types/onboarding";

const ALL_STATUSES: OnboardingStatus[] = [
  "DRAFT", "PROCESSING", "REVIEW", "GATE_PENDING", "READY_TO_GENERATE", "GENERATED", "FAILED",
];

const DATE_RANGES = [
  { label: "All time", value: "all" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const STATUS_COLORS: Record<OnboardingStatus, string> = {
  DRAFT: "bg-slate-400",
  PROCESSING: "bg-blue-500",
  REVIEW: "bg-amber-500",
  GATE_PENDING: "bg-purple-500",
  READY_TO_GENERATE: "bg-cyan-500",
  GENERATED: "bg-green-500",
  FAILED: "bg-red-500",
};

function getProgressForStatus(status: OnboardingStatus): number {
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

export default function OnboardingListPage() {
  const requests = useOnboardingStore((s) => s.requests);
  const { duplicateRequest, archiveRequest, addAuditEvent } = useOnboardingStore();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | "ALL">("ALL");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const owners = useMemo(() => {
    const unique = Array.from(new Set(requests.map((r) => r.owner)));
    return unique.sort();
  }, [requests]);

  const activeCount = requests.filter((r) => !r.archived).length;
  const archivedCount = requests.filter((r) => r.archived).length;

  const statusCounts = useMemo(() => {
    const base = requests.filter((r) => (showArchived ? r.archived : !r.archived));
    const counts: Record<string, number> = { ALL: base.length };
    for (const s of ALL_STATUSES) {
      counts[s] = base.filter((r) => r.status === s).length;
    }
    return counts;
  }, [requests, showArchived]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return requests.filter((r) => {
      if (r.archived && !showArchived) return false;
      if (!r.archived && showArchived) return false;

      const matchSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.owner.toLowerCase().includes(search.toLowerCase()) ||
        r.org.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchOwner = ownerFilter === "ALL" || r.owner === ownerFilter;

      let matchDate = true;
      if (dateRange !== "all") {
        const days = parseInt(dateRange);
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        matchDate = new Date(r.updatedAt).getTime() >= cutoff;
      }

      return matchSearch && matchStatus && matchOwner && matchDate;
    });
  }, [requests, search, statusFilter, ownerFilter, dateRange, showArchived]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [filtered]
  );

  const hasActiveFilters = search || statusFilter !== "ALL" || ownerFilter !== "ALL" || dateRange !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setOwnerFilter("ALL");
    setDateRange("all");
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateRequest(id);
    if (dup) {
      addAuditEvent({
        id: `aud-dup-${Date.now()}`,
        onboardingId: dup.id,
        userId: currentUser.id,
        userName: currentUser.name,
        action: "create",
        detail: `Duplicated from request`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleArchive = (id: string) => {
    archiveRequest(id);
    addAuditEvent({
      id: `aud-arch-${Date.now()}`,
      onboardingId: id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "archive",
      detail: "Request archived",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Onboarding Requests</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage and track all project onboarding requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              {showArchived ? `Active (${activeCount})` : `Archived (${archivedCount})`}
            </Button>
            {(currentUser.role === "pm" || currentUser.role === "admin") && (
              <Link href="/onboarding/new">
                <Button size="sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Onboarding
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
              statusFilter === "ALL" ? "bg-primary-foreground/20" : "bg-background"
            }`}>{statusCounts["ALL"]}</span>
          </button>
          {ALL_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const count = statusCounts[status] || 0;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                {cfg.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  statusFilter === status ? "bg-primary-foreground/20" : "bg-background"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, owner, or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Owners</SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{sorted.length}</span> request{sorted.length !== 1 ? "s" : ""}
            {hasActiveFilters && " (filtered)"}
          </p>
        </div>

        {/* Request List */}
        {sorted.length === 0 ? (
          <Card className="gap-0 py-0">
            <CardContent className="py-0">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-sm font-medium">
                  {showArchived ? "No archived requests" : "No requests found"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search query"
                    : showArchived
                      ? "Archived requests will appear here"
                      : "Create your first onboarding request to get started"}
                </p>
                {!showArchived && !hasActiveFilters && (
                  <Link href="/onboarding/new">
                    <Button size="sm" className="mt-4">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Onboarding
                    </Button>
                  </Link>
                )}
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sorted.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status as OnboardingStatus];
              const progress = getProgressForStatus(req.status as OnboardingStatus);
              return (
                <Card key={req.id} className="gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex items-center">
                      {/* Color strip */}
                      <div className={`w-1 self-stretch rounded-l-xl ${STATUS_COLORS[req.status as OnboardingStatus]}`} />

                      <div className="flex flex-1 items-center gap-4 px-4 py-3">
                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/workspace/${req.id}`}
                              className="text-sm font-medium truncate hover:underline"
                            >
                              {req.name}
                            </Link>
                            <Badge variant={statusCfg.variant} className="text-[10px] shrink-0">
                              {statusCfg.label}
                            </Badge>
                            {req.confidentiality === "Restricted" && (
                              <Badge variant="outline" className="text-[10px] shrink-0 border-red-200 text-red-600">
                                Restricted
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground/70">{req.owner}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{req.org}</span>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <FileText className="h-3 w-3" /> {req.documents.length} doc{req.documents.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{req.category}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="hidden md:flex items-center gap-2 shrink-0 w-32">
                          <Progress value={progress} className="h-1.5 flex-1" />
                          <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">{progress}%</span>
                        </div>

                        {/* Time */}
                        <div className="hidden sm:block shrink-0 text-right w-20">
                          <p className="text-[11px] text-muted-foreground">{timeAgo(req.updatedAt)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Link href={`/workspace/${req.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/workspace/${req.id}`}>
                                  <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(req.id)}>
                                <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                              </DropdownMenuItem>
                              {!req.archived && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleArchive(req.id)} className="text-destructive">
                                    <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
