"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  GitBranch,
  CheckSquare,
  Tags,
  Pencil,
  Plus,
  Trash2,
  MoreHorizontal,
  Copy,
  Layers,
  Search,
  Inbox,
} from "lucide-react";

interface TemplateData {
  id: string;
  title: string;
  description: string;
  icon: "backlog" | "wiki" | "compliance" | "labels";
  items: string[];
  usageCount: number;
  lastModified: string;
}

const ICON_MAP = {
  backlog: GitBranch,
  wiki: FileText,
  compliance: CheckSquare,
  labels: Tags,
};

const ICON_BG_MAP = {
  backlog: "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
  wiki: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40",
  compliance: "bg-purple-100 text-purple-600 dark:bg-purple-900/40",
  labels: "bg-amber-100 text-amber-600 dark:bg-amber-900/40",
};

const CATEGORY_LABELS: Record<string, string> = {
  backlog: "Backlog",
  wiki: "Wiki",
  compliance: "Compliance",
  labels: "Labels & Milestones",
};

const INITIAL_TEMPLATES: TemplateData[] = [
  {
    id: "tpl-backlog",
    title: "Backlog Structure Template",
    description: "Standard hierarchy: Epic > Feature > Story > Task with required fields and acceptance criteria",
    icon: "backlog",
    items: ["Epic template", "Feature template", "Story template", "Task template"],
    usageCount: 8,
    lastModified: "2026-02-28T10:00:00Z",
  },
  {
    id: "tpl-wiki",
    title: "Wiki Structure Template",
    description: "Standard wiki sections for project documentation, including business context, architecture, and delivery plan",
    icon: "wiki",
    items: [
      "Overview", "Business Goals", "Functional Scope", "Non-Functional Requirements",
      "Assumptions", "Risks", "Architecture", "Delivery Plan",
    ],
    usageCount: 12,
    lastModified: "2026-02-25T14:30:00Z",
  },
  {
    id: "tpl-compliance",
    title: "Compliance Checklist Templates",
    description: "Predefined compliance checklists for different regulatory and internal standards",
    icon: "compliance",
    items: ["Internal Standard (5 checks)", "BNI Standard (12 checks)"],
    usageCount: 6,
    lastModified: "2026-03-01T09:15:00Z",
  },
  {
    id: "tpl-labels",
    title: "Label & Milestone Rules",
    description: "Standard labels, tagging conventions, and milestone phases for project management consistency",
    icon: "labels",
    items: ["Priority labels (Critical, High, Medium, Low)", "Type labels (Bug, Feature, Enhancement)", "Phase milestones (Phase 1, 2, 3)"],
    usageCount: 10,
    lastModified: "2026-02-20T16:00:00Z",
  },
];

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateData[]>(INITIAL_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editItems, setEditItems] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const openEdit = (tpl: TemplateData) => {
    setEditingTemplate(tpl);
    setEditTitle(tpl.title);
    setEditDescription(tpl.description);
    setEditItems(tpl.items.join("\n"));
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              title: editTitle,
              description: editDescription,
              items: editItems.split("\n").filter((l) => l.trim()),
              lastModified: new Date().toISOString(),
            }
          : t
      )
    );
    setEditingTemplate(null);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicate = (tpl: TemplateData) => {
    const dup: TemplateData = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      title: `${tpl.title} (Copy)`,
      usageCount: 0,
      lastModified: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, dup]);
  };

  const handleAdd = () => {
    const newTpl: TemplateData = {
      id: `tpl-${Date.now()}`,
      title: "New Template",
      description: "Template description",
      icon: "labels",
      items: ["Item 1"],
      usageCount: 0,
      lastModified: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTpl]);
    openEdit(newTpl);
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchSearch = !search || tpl.title.toLowerCase().includes(search.toLowerCase()) || tpl.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || tpl.icon === filterCategory;
    return matchSearch && matchCategory;
  });

  const categories = ["all", "backlog", "wiki", "compliance", "labels"];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Templates & Standards</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage templates for backlog structure, wiki outlines, compliance checklists, and labeling conventions
            </p>
          </div>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Template
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["backlog", "wiki", "compliance", "labels"] as const).map((cat) => {
            const Icon = ICON_MAP[cat];
            const count = templates.filter((t) => t.icon === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  filterCategory === cat ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${ICON_BG_MAP[cat]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[cat]}</p>
                  <p className="text-sm font-semibold leading-none mt-0.5">{count} template{count !== 1 ? "s" : ""}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-9 text-sm"
          />
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredTemplates.length}</span> of {templates.length} template{templates.length !== 1 ? "s" : ""}
        </p>

        {/* Template cards */}
        {filteredTemplates.length === 0 ? (
          <Card className="gap-0 py-0">
            <CardContent className="py-0">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-sm font-medium">No templates found</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {search ? "Try adjusting your search" : "Create your first template to get started"}
                </p>
                {!search && (
                  <Button size="sm" className="mt-4" onClick={handleAdd}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Template
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredTemplates.map((tpl) => {
              const IconComp = ICON_MAP[tpl.icon];
              return (
                <Card key={tpl.id} className="gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="px-4 pt-4 pb-3">
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_BG_MAP[tpl.icon]}`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold leading-tight">{tpl.title}</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(tpl)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(tpl)}>
                              <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(tpl.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Items */}
                      <div className="mt-3 space-y-1">
                        {tpl.items.slice(0, 4).map((item, idx) => (
                          <div key={item} className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-medium bg-background border text-muted-foreground">{idx + 1}</span>
                            <span className="text-xs truncate">{item}</span>
                          </div>
                        ))}
                        {tpl.items.length > 4 && (
                          <button
                            onClick={() => openEdit(tpl)}
                            className="w-full rounded-md bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-muted/50 transition-colors text-center"
                          >
                            +{tpl.items.length - 4} more items
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="flex items-center justify-between border-t px-4 py-2">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" /> {tpl.items.length} items
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>Used in {tpl.usageCount} project{tpl.usageCount !== 1 ? "s" : ""}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(tpl.lastModified)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => { if (!open) setEditingTemplate(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Modify the template details and items below. Each item should be on a separate line.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Items</Label>
                <span className="text-[10px] text-muted-foreground">
                  {editItems.split("\n").filter((l) => l.trim()).length} items
                </span>
              </div>
              <Textarea
                value={editItems}
                onChange={(e) => setEditItems(e.target.value)}
                className="min-h-[180px] font-mono text-sm"
                placeholder="One item per line..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
