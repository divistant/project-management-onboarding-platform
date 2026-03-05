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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Building2,
  FolderKanban,
  FolderOpen
} from "lucide-react";
import type { OnboardingStatus } from "@/types/onboarding";
import { useT } from "@/lib/i18n/use-translation";

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

type SortField = "name" | "status" | "owner" | "updatedAt";
type SortDir = "asc" | "desc";

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

function timeAgo(timestamp: string, t: ReturnType<typeof useT>): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("common_just_now");
  if (minutes < 60) return `${minutes}${t("common_minutes")} ${t("common_ago")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t("common_hours")} ${t("common_ago")}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}${t("common_days")} ${t("common_ago")}`;
  return new Date(timestamp).toLocaleDateString();
}

export default function OnboardingListPage() {
  const requests = useOnboardingStore((s) => s.requests);
  const { duplicateRequest, archiveRequest, addAuditEvent } = useOnboardingStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const t = useT();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | "ALL">("ALL");
  const [ownerFilter, setOwnerFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Sorting and selection state
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "owner": cmp = a.owner.localeCompare(b.owner); break;
        case "updatedAt": cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

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

  const handleArchive = (id: string, isBulk = false) => {
    archiveRequest(id);
    addAuditEvent({
      id: `aud-arch-${Date.now()}-${id}`,
      onboardingId: id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "archive",
      detail: isBulk ? "Bulk archived" : "Request archived",
      timestamp: new Date().toISOString(),
    });
  };

  // Sorting handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  // Selection handlers
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sorted.map((u) => u.id)));
    }
  };

  const handleBulkArchive = () => {
    selectedIds.forEach((id) => handleArchive(id, true));
    setSelectedIds(new Set());
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("onb_title")}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("onb_new_desc")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowArchived(!showArchived);
                setSelectedIds(new Set());
              }}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              {showArchived ? `Active (${activeCount})` : `Archived (${archivedCount})`}
            </Button>
            {(currentUser.role === "pm" || currentUser.role === "admin") && (
              <Link href="/onboarding/new">
                <Button size="sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t("onb_new")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${statusFilter === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            {t("onb_filter_all")}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${statusFilter === "ALL" ? "bg-primary-foreground/20" : "bg-background"
              }`}>{statusCounts["ALL"]}</span>
          </button>
          {ALL_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const count = statusCounts[status] || 0;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                {cfg.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${statusFilter === status ? "bg-primary-foreground/20" : "bg-background"
                  }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Bulk Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 min-h-[40px]">
          {selectedIds.size > 0 && !showArchived ? (
            <div className="flex items-center gap-3 w-full rounded-lg border bg-muted/40 px-4 py-2">
              <span className="text-sm font-medium">{selectedIds.size} project{selectedIds.size !== 1 ? 's' : ''} selected</span>
              <div className="h-4 w-px bg-border" />
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleBulkArchive}>
                <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive Selected
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedIds(new Set())}>
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-w-[280px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("onb_search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="h-9 w-[160px] text-xs">
                    <SelectValue placeholder="Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("onb_filter_all")}</SelectItem>
                    {owners.map((owner) => (
                      <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-9 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" className="h-9 text-muted-foreground ml-1" onClick={clearFilters}>
                    <X className="mr-1.5 h-3.5 w-3.5" /> {t("common_reset")}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Enterprise Data Table */}
        <Card className="gap-0 py-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground border-b text-xs">
                  <tr>
                    {!showArchived && (
                      <th className="px-4 py-3 min-w-[48px] w-12 text-center font-medium">
                        <Checkbox
                          checked={selectedIds.size === sorted.length && sorted.length > 0}
                          onCheckedChange={toggleAll}
                          className="mt-1 border-muted-foreground/30 data-[state=checked]:border-primary"
                        />
                      </th>
                    )}
                    <th className={`py-3 font-medium transition-colors hover:text-foreground cursor-pointer ${showArchived ? 'px-4' : 'pr-4'}`}>
                      <button className="flex items-center gap-1.5 outline-none" onClick={() => handleSort("name")}>
                        Project <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium transition-colors hover:text-foreground cursor-pointer">
                      <button className="flex items-center gap-1.5 outline-none" onClick={() => handleSort("status")}>
                        Status <SortIcon field="status" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium transition-colors hover:text-foreground cursor-pointer">
                      <button className="flex items-center gap-1.5 outline-none" onClick={() => handleSort("owner")}>
                        Owner <SortIcon field="owner" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium min-w-[140px]">
                      <span>Progress</span>
                    </th>
                    <th className="px-4 py-3 font-medium transition-colors hover:text-foreground cursor-pointer">
                      <button className="flex items-center gap-1.5 outline-none" onClick={() => handleSort("updatedAt")}>
                        Last Updated <SortIcon field="updatedAt" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium w-16 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {sorted.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                            <FolderOpen className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {showArchived ? "No archived requests" : "No requests found"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                            {hasActiveFilters
                              ? "Try adjusting your filters or search query"
                              : showArchived
                                ? "Archived requests will appear here"
                                : "Create your first onboarding request to get started"}
                          </p>
                          {!showArchived && !hasActiveFilters && (
                            <Link href="/onboarding/new">
                              <Button size="sm" className="mt-4 h-8 text-xs">
                                <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Onboarding
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sorted.map((req) => {
                      const statusCfg = STATUS_CONFIG[req.status as OnboardingStatus];
                      const progress = getProgressForStatus(req.status as OnboardingStatus);
                      const initials = req.owner.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

                      return (
                        <tr
                          key={req.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          {!showArchived && (
                            <td className="px-4 py-3 w-12 text-center align-middle">
                              <Checkbox
                                checked={selectedIds.has(req.id)}
                                onCheckedChange={() => toggleSelected(req.id)}
                                className="mt-0.5 border-muted-foreground/30 data-[state=checked]:border-primary"
                              />
                            </td>
                          )}
                          <td className={`py-3 align-middle ${showArchived ? 'px-4' : 'pr-4'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground shadow-sm ${STATUS_COLORS[req.status as OnboardingStatus].replace('bg-', 'border-').replace('500', '200')}`}>
                                <FolderKanban className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/workspace/${req.id}`}
                                  className="text-sm font-medium hover:underline text-foreground truncate block"
                                >
                                  {req.name}
                                </Link>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                  <Building2 className="h-3 w-3" />
                                  <span className="truncate max-w-[120px]">{req.org}</span>
                                  {req.confidentiality === "Restricted" && (
                                    <>
                                      <span>·</span>
                                      <span className="text-red-500 font-medium">Restricted</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <Badge variant={statusCfg.variant} className="text-[10px] font-medium whitespace-nowrap">
                              {statusCfg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border bg-background shrink-0">
                                <AvatarFallback className="text-[9px] font-medium text-muted-foreground">{initials}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs truncate max-w-[100px]">{req.owner}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-2 w-full max-w-[140px]">
                              <Progress value={progress} className="h-1.5 flex-1 bg-muted" />
                              <span className="text-[10px] font-medium text-muted-foreground w-7 text-right">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(req.updatedAt, t)}
                          </td>
                          <td className="px-4 py-3 align-middle text-right w-16">
                            <div className="flex items-center justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/workspace/${req.id}`} className="cursor-pointer">
                                      <FolderOpen className="mr-2 h-4 w-4" /> {t("onb_open")}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(req.id)}>
                                    <Copy className="mr-2 h-4 w-4" /> {t("onb_duplicate")}
                                  </DropdownMenuItem>
                                  {!req.archived && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleArchive(req.id)} className="text-destructive focus:text-destructive">
                                        <Archive className="mr-2 h-4 w-4" /> {t("onb_archive")}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {sorted.length > 0 && (
              <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{sorted.length}</span> request{sorted.length !== 1 ? "s" : ""}
                  {hasActiveFilters && " (filtered)"}
                </p>
                <div className="text-[10px] text-muted-foreground">
                  Updated just now
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
