"use client";

import { useState, useMemo, useCallback } from "react";
import type { OnboardingRequest, User, BacklogItem } from "@/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Save,
  Plus,
  Tags,
  Milestone,
  FileDown,
  Check,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  epic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  feature: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  story: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  task: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const PRIORITY_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

function computeQuality(item: BacklogItem): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 0;
  let checks = 0;

  checks++;
  if (item.acceptanceCriteria.length > 0) score++;
  else issues.push("Missing acceptance criteria");

  checks++;
  if (item.estimate) score++;
  else issues.push("Missing estimate");

  checks++;
  if (item.labels.length > 0) score++;
  else issues.push("No labels assigned");

  checks++;
  if (item.title.length > 10) score++;
  else issues.push("Title too short/generic");

  checks++;
  if (item.description.length > 10) score++;
  else issues.push("Description too short");

  return { score: Math.round((score / checks) * 100), issues };
}

export function BacklogDraftView({
  request,
  currentUser,
}: {
  request: OnboardingRequest;
  currentUser: User;
}) {
  const { updateBacklogItem, addBacklogItem, addAuditEvent } = useOnboardingStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    request.backlogDraft?.items.forEach((i) => ids.add(i.id));
    return ids;
  });
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BacklogItem>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", type: "story" as BacklogItem["type"], priority: "Medium" as BacklogItem["priority"] });
  const [batchMessage, setBatchMessage] = useState("");
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [batchLabel, setBatchLabel] = useState("");
  const [batchMilestone, setBatchMilestone] = useState("");

  if (!request.backlogDraft) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Backlog draft not generated yet. Run the processing pipeline first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const allItems = flattenTree(request.backlogDraft.items);
  const selected = allItems.find((i) => i.id === selectedItem);

  const qualityMap = useMemo(() => {
    const map = new Map<string, { score: number; issues: string[] }>();
    allItems.forEach((item) => map.set(item.id, computeQuality(item)));
    return map;
  }, [allItems]);

  const avgScore = allItems.length > 0
    ? Math.round(Array.from(qualityMap.values()).reduce((a, v) => a + v.score, 0) / allItems.length)
    : 0;
  const totalIssues = Array.from(qualityMap.values()).filter((v) => v.issues.length > 0).length;

  const selectedQuality = selected ? qualityMap.get(selected.id) : undefined;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEdit = () => {
    if (!selected) return;
    setEditData({
      title: selected.title,
      description: selected.description,
      acceptanceCriteria: [...selected.acceptanceCriteria],
      type: selected.type,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selected || !editData.title?.trim()) return;
    updateBacklogItem(request.id, selected.id, editData);
    addAuditEvent({
      id: `aud-bl-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Updated backlog item: ${editData.title || selected.title}`,
      timestamp: new Date().toISOString(),
    });
    setIsEditing(false);
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const handleAddItem = () => {
    if (!newItem.title.trim()) return;
    const item: BacklogItem = {
      id: `item-${Date.now()}`,
      type: newItem.type,
      title: newItem.title,
      description: "",
      priority: newItem.priority,
      labels: [],
      acceptanceCriteria: [],
      dependencies: [],
    };
    addBacklogItem(request.id, selectedItem, item);
    addAuditEvent({
      id: `aud-add-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Added backlog item: ${item.title}`,
      timestamp: new Date().toISOString(),
    });
    setAddDialogOpen(false);
    setNewItem({ title: "", type: "story", priority: "Medium" });
    if (selectedItem) setExpandedIds((p) => new Set([...p, selectedItem]));
  };

  const showBatchMessage = (msg: string) => {
    setBatchMessage(msg);
    setTimeout(() => setBatchMessage(""), 2500);
  };

  const handleBatchAssignLabels = () => {
    if (!batchLabel.trim()) return;
    const labels = batchLabel.split(",").map((l) => l.trim()).filter(Boolean);
    allItems.forEach((item) => {
      const merged = Array.from(new Set([...item.labels, ...labels]));
      updateBacklogItem(request.id, item.id, { labels: merged });
    });
    addAuditEvent({
      id: `aud-batch-label-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Batch assigned labels: ${labels.join(", ")} to ${allItems.length} items`,
      timestamp: new Date().toISOString(),
    });
    setLabelDialogOpen(false);
    setBatchLabel("");
    showBatchMessage(`Labels "${labels.join(", ")}" assigned to ${allItems.length} items`);
  };

  const handleBatchSetMilestone = () => {
    if (!batchMilestone.trim()) return;
    allItems.forEach((item) => {
      updateBacklogItem(request.id, item.id, { milestone: batchMilestone });
    });
    addAuditEvent({
      id: `aud-batch-ms-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Batch set milestone: ${batchMilestone} to ${allItems.length} items`,
      timestamp: new Date().toISOString(),
    });
    setMilestoneDialogOpen(false);
    setBatchMilestone("");
    showBatchMessage(`Milestone "${batchMilestone}" set for ${allItems.length} items`);
  };

  const renderTree = (items: BacklogItem[], depth: number = 0): React.ReactNode[] => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedIds.has(item.id);
      const isSelected = selectedItem === item.id;
      const quality = qualityMap.get(item.id);

      return (
        <div key={item.id}>
          <button
            onClick={() => {
              setSelectedItem(item.id);
              setIsEditing(false);
              if (hasChildren) toggleExpand(item.id);
            }}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3 shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 shrink-0" />
              )
            ) : (
              <span className="w-3" />
            )}
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[item.type]}`}>
              {item.type.toUpperCase()}
            </span>
            <span className="flex-1 truncate">{item.title}</span>
            {quality && quality.issues.length > 0 && (
              <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
            )}
          </button>
          {hasChildren && isExpanded && renderTree(item.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Avg Completeness</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={avgScore} className="flex-1 h-2" />
            <span className="text-sm font-semibold tabular-nums">{avgScore}%</span>
          </div>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 min-w-[120px]">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums">{allItems.length}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 min-w-[140px]">
          <p className="text-xs text-muted-foreground">Items with Issues</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-amber-600">{totalIssues}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Item
        </Button>
        <Button variant="outline" size="sm" onClick={() => setLabelDialogOpen(true)}>
          <Tags className="mr-1.5 h-3.5 w-3.5" /> Assign Labels
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMilestoneDialogOpen(true)}>
          <Milestone className="mr-1.5 h-3.5 w-3.5" /> Set Milestone
        </Button>
        <Button variant="outline" size="sm" onClick={() => showBatchMessage("Export preview generated")}>
          <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export Preview
        </Button>
        {batchMessage && (
          <span className="flex items-center gap-1 text-xs text-green-600 animate-in fade-in">
            <Check className="h-3 w-3" /> {batchMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <Card className="h-[500px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Backlog Tree</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ScrollArea className="h-[430px]">
                <div className="px-1">
                  {renderTree(request.backlogDraft.items)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-7">
          <Card className="h-[500px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {selected?.title || "Select an item"}
                  </CardTitle>
                  {saveIndicator && (
                    <span className="flex items-center gap-1 text-xs text-green-600 animate-in fade-in">
                      <Check className="h-3 w-3" /> Saved
                    </span>
                  )}
                </div>
                {selected && (
                  <div className="flex gap-1">
                    {isEditing ? (
                      <Button size="sm" onClick={handleSave} disabled={!editData.title?.trim()}>
                        <Save className="mr-1 h-4 w-4" /> Save
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[430px]">
                {!selected ? (
                  <p className="text-sm text-muted-foreground">
                    Select an item from the backlog tree.
                  </p>
                ) : isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Title *</Label>
                      <Input
                        value={editData.title || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                        aria-invalid={!editData.title?.trim()}
                      />
                      {!editData.title?.trim() && <p className="text-xs text-destructive mt-1">Title is required</p>}
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={editData.type || selected.type}
                        onValueChange={(v) => setEditData((p) => ({ ...p, type: v as BacklogItem["type"] }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="epic">Epic</SelectItem>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={editData.description || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Acceptance Criteria (one per line)</Label>
                      <Textarea
                        value={(editData.acceptanceCriteria || []).join("\n")}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            acceptanceCriteria: e.target.value.split("\n").filter((l) => l.trim()),
                          }))
                        }
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${TYPE_COLORS[selected.type]}`}>
                        {selected.type.toUpperCase()}
                      </span>
                      <Badge variant={PRIORITY_VARIANTS[selected.priority]}>
                        {selected.priority}
                      </Badge>
                      {selected.estimate && (
                        <Badge variant="outline">{selected.estimate}</Badge>
                      )}
                      {selected.labels.map((l) => (
                        <Badge key={l} variant="secondary">{l}</Badge>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Description</p>
                      <p className="mt-1 text-sm">{selected.description || "—"}</p>
                    </div>
                    {selected.acceptanceCriteria.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Acceptance Criteria</p>
                        <ul className="mt-1 space-y-1">
                          {selected.acceptanceCriteria.map((ac, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-green-500" />
                              {ac}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedQuality && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Completeness</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={selectedQuality.score} className="w-32" />
                          <span className="text-sm">{selectedQuality.score}%</span>
                        </div>
                      </div>
                    )}
                    {selectedQuality && selectedQuality.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-amber-600">Quality Issues</p>
                        <ul className="mt-1 space-y-1">
                          {selectedQuality.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selected.dependencies.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Dependencies</p>
                        <div className="mt-1 flex gap-1">
                          {selected.dependencies.map((dep) => (
                            <Badge key={dep} variant="outline">{dep}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={labelDialogOpen} onOpenChange={setLabelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Labels to All Items</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter labels separated by commas. They will be added to all {allItems.length} backlog items.
          </p>
          <Input
            placeholder="e.g. backend, frontend, priority::high"
            value={batchLabel}
            onChange={(e) => setBatchLabel(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLabelDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleBatchAssignLabels} disabled={!batchLabel.trim()}>
              Assign to All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Milestone for All Items</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Choose or enter a milestone. It will be applied to all {allItems.length} backlog items.
          </p>
          <Select value={batchMilestone} onValueChange={setBatchMilestone}>
            <SelectTrigger>
              <SelectValue placeholder="Select a milestone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phase 1 - Foundation">Phase 1 - Foundation</SelectItem>
              <SelectItem value="Phase 2 - Core Features">Phase 2 - Core Features</SelectItem>
              <SelectItem value="Phase 3 - Polish & Launch">Phase 3 - Polish & Launch</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleBatchSetMilestone} disabled={!batchMilestone.trim()}>
              Set Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Backlog Item</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {selectedItem ? `Adding as child of: ${selected?.title}` : "Adding at root level"}
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Title *</Label>
              <Input
                placeholder="Item title"
                value={newItem.title}
                onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={newItem.type} onValueChange={(v) => setNewItem((p) => ({ ...p, type: v as BacklogItem["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={newItem.priority} onValueChange={(v) => setNewItem((p) => ({ ...p, priority: v as BacklogItem["priority"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddItem} disabled={!newItem.title.trim()}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function flattenTree(items: BacklogItem[]): BacklogItem[] {
  const result: BacklogItem[] = [];
  const walk = (list: BacklogItem[]) => {
    for (const item of list) {
      result.push(item);
      if (item.children) walk(item.children);
    }
  };
  walk(items);
  return result;
}
