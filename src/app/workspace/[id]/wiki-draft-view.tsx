"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OnboardingRequest, User, WikiSection } from "@/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  RefreshCw,
  GripVertical,
  Save,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react";

export function WikiDraftView({
  request,
  currentUser,
}: {
  request: OnboardingRequest;
  currentUser: User;
}) {
  const { updateWikiSection, addWikiSection, reorderWikiSections, addAuditEvent } =
    useOnboardingStore();
  const [selectedSection, setSelectedSection] = useState<string | null>(
    request.wikiDraft?.outline[0]?.id || null
  );
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [regenDialogOpen, setRegenDialogOpen] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const showSaved = useCallback(() => {
    setSaveIndicator(true);
    const timer = setTimeout(() => setSaveIndicator(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!request.wikiDraft) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Wiki draft not generated yet. Run the processing pipeline first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sections = request.wikiDraft.outline;
  const currentSection = sections.find((s) => s.id === selectedSection);
  const currentIndex = sections.findIndex((s) => s.id === selectedSection);

  const handleEdit = () => {
    if (!currentSection) return;
    setEditContent(currentSection.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentSection) return;
    updateWikiSection(request.id, currentSection.id, editContent);
    addAuditEvent({
      id: `aud-wiki-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Edited wiki section: ${currentSection.title}`,
      timestamp: new Date().toISOString(),
    });
    setIsEditing(false);
    showSaved();
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSection: WikiSection = {
      id: `ws-${Date.now()}`,
      title: newSectionTitle,
      content: `# ${newSectionTitle}\n\nContent here...`,
      sourceRefs: [],
      order: sections.length,
    };
    addWikiSection(request.id, newSection);
    setNewSectionTitle("");
    setSelectedSection(newSection.id);
  };

  const handleMoveUp = () => {
    if (currentIndex <= 0) return;
    const reordered = [...sections];
    [reordered[currentIndex - 1], reordered[currentIndex]] = [reordered[currentIndex], reordered[currentIndex - 1]];
    reorderWikiSections(request.id, reordered.map((s, i) => ({ ...s, order: i })));
  };

  const handleMoveDown = () => {
    if (currentIndex >= sections.length - 1 || currentIndex < 0) return;
    const reordered = [...sections];
    [reordered[currentIndex], reordered[currentIndex + 1]] = [reordered[currentIndex + 1], reordered[currentIndex]];
    reorderWikiSections(request.id, reordered.map((s, i) => ({ ...s, order: i })));
  };

  const handleRegenerate = () => {
    if (!currentSection) return;
    setRegenLoading(true);
    setTimeout(() => {
      const newContent = `# ${currentSection.title}\n\n[AI Regenerated] This section has been regenerated with updated content based on the source documents.\n\n${currentSection.content.split("\n").slice(2).join("\n")}`;
      updateWikiSection(request.id, currentSection.id, newContent);
      addAuditEvent({
        id: `aud-regen-${Date.now()}`,
        onboardingId: request.id,
        userId: currentUser.id,
        userName: currentUser.name,
        action: "edit",
        detail: `Regenerated wiki section: ${currentSection.title}`,
        timestamp: new Date().toISOString(),
      });
      setRegenLoading(false);
      setRegenDialogOpen(false);
    }, 1000);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragCounter.current++;
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const fromIndex = sections.findIndex((s) => s.id === draggedId);
    const toIndex = sections.findIndex((s) => s.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    reorderWikiSections(request.id, reordered.map((s, i) => ({ ...s, order: i })));

    addAuditEvent({
      id: `aud-reorder-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Reordered wiki section "${moved.title}" from position ${fromIndex + 1} to ${toIndex + 1}`,
      timestamp: new Date().toISOString(),
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <Card className="h-[600px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Wiki Outline</CardTitle>
              <div className="flex gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMoveUp}
                  disabled={currentIndex <= 0}
                  title="Move Up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMoveDown}
                  disabled={currentIndex >= sections.length - 1 || currentIndex < 0}
                  title="Move Down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Section</DialogTitle>
                    </DialogHeader>
                    <Input
                      placeholder="Section title"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button size="sm" onClick={handleAddSection} disabled={!newSectionTitle.trim()}>Add</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="h-[480px] overflow-y-auto scrollbar-hide">
              <div className="space-y-0.5">
                {sections.map((section, idx) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragEnd={handleDragEnd}
                    onDragEnter={(e) => handleDragEnter(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, section.id)}
                    className={`rounded-lg transition-colors ${
                      dragOverId === section.id && draggedId !== section.id
                        ? "ring-2 ring-primary/40 bg-primary/5"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSection(section.id);
                        setIsEditing(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        selectedSection === section.id
                          ? "bg-muted text-foreground"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing" />
                      <span className="w-5 shrink-0 text-xs text-muted-foreground text-center">{idx + 1}</span>
                      <span className="flex-1 truncate">{section.title}</span>
                      <div className="flex gap-0.5 shrink-0">
                        {section.sourceRefs.map((ref) => (
                          <Badge key={ref} variant="outline" className="text-[10px] px-1 py-0">
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-8">
        <Card className="h-[600px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  {currentSection?.title || "Select a section"}
                </CardTitle>
                {saveIndicator && (
                  <span className="flex items-center gap-1 text-xs text-green-600 animate-in fade-in">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
              {currentSection && (
                <div className="flex gap-1">
                  <Dialog open={regenDialogOpen} onOpenChange={setRegenDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Regenerate section">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Regenerate Section</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        Regenerate &quot;{currentSection.title}&quot;? Current content will be replaced with AI-generated content.
                      </p>
                      <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setRegenDialogOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleRegenerate} disabled={regenLoading}>
                          {regenLoading ? "Regenerating..." : "Regenerate"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {isEditing ? (
                    <Button size="sm" onClick={handleSave}>
                      <Save className="mr-1 h-4 w-4" /> Save
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <FileText className="mr-1 h-4 w-4" /> Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
            {currentSection && (
              <p className="text-xs text-muted-foreground">
                Sources: {currentSection.sourceRefs.join(", ") || "None"}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px]">
              {!currentSection ? (
                <p className="text-sm text-muted-foreground">
                  Select a section from the outline to view or edit.
                </p>
              ) : isEditing ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
                    <span><kbd className="rounded border bg-background px-1 font-mono"># H1</kbd> Heading 1</span>
                    <span><kbd className="rounded border bg-background px-1 font-mono">## H2</kbd> Heading 2</span>
                    <span><kbd className="rounded border bg-background px-1 font-mono">**bold**</kbd> Bold</span>
                    <span><kbd className="rounded border bg-background px-1 font-mono">*italic*</kbd> Italic</span>
                    <span><kbd className="rounded border bg-background px-1 font-mono">- item</kbd> List</span>
                    <span><kbd className="rounded border bg-background px-1 font-mono">`code`</kbd> Code</span>
                  </div>
                  <Textarea
                    className="min-h-[410px] font-mono text-sm"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write your content using Markdown syntax..."
                  />
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {currentSection.content}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
