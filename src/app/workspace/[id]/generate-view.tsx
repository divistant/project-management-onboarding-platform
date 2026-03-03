"use client";

import { useState, useCallback } from "react";
import type { OnboardingRequest, User } from "@/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Rocket,
  CheckCircle2,
  Lock,
  ExternalLink,
  Download,
  GitBranch,
  BookOpen,
  ListTodo,
  Tag,
  Milestone,
  FolderGit2,
  Globe,
  ShieldCheck,
  FileText,
  CircleDot,
} from "lucide-react";

type GenerateState = "idle" | "preview" | "generating" | "success";

export function GenerateView({
  request,
  currentUser,
}: {
  request: OnboardingRequest;
  currentUser: User;
}) {
  const { updateStatus, addAuditEvent } = useOnboardingStore();
  const [state, setState] = useState<GenerateState>(
    request.status === "GENERATED" ? "success" : "idle"
  );
  const [progress, setProgress] = useState(0);
  const [showPayload, setShowPayload] = useState(false);

  const gateApproved = request.compliance?.gateStatus === "approved";
  const canGenerate =
    gateApproved &&
    request.status !== "GENERATED" &&
    (currentUser.role === "pm" || currentUser.role === "admin");

  const gitlabConfig = request.integrations.find((i) => i.targetTool === "gitlab");

  const payload = buildPayload(request);

  const wikiReady = (request.wikiDraft?.outline.length || 0) > 0;
  const backlogReady = countBacklogItems(request) > 0;
  const complianceReady = gateApproved;
  const readinessChecks = [
    { label: "Wiki draft", ready: wikiReady, detail: `${request.wikiDraft?.outline.length || 0} pages` },
    { label: "Backlog draft", ready: backlogReady, detail: `${countBacklogItems(request)} items` },
    { label: "Compliance gate", ready: complianceReady, detail: complianceReady ? "Approved" : "Pending" },
  ];
  const allReady = readinessChecks.every((c) => c.ready);

  const handleGenerate = useCallback(() => {
    setState("generating");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setState("success");
          updateStatus(request.id, "GENERATED");
          addAuditEvent({
            id: `aud-gen-${Date.now()}`,
            onboardingId: request.id,
            userId: currentUser.id,
            userName: currentUser.name,
            action: "generate",
            detail: `Generated to GitLab: ${gitlabConfig?.mappingConfig?.namespace || "default"}/${gitlabConfig?.mappingConfig?.projectName || request.name}`,
            timestamp: new Date().toISOString(),
          });
          return 100;
        }
        return p + 5;
      });
    }, 150);
  }, [request, currentUser, gitlabConfig, updateStatus, addAuditEvent]);

  const mappingItems = [
    { icon: FolderGit2, label: "Project Name", value: gitlabConfig?.mappingConfig?.projectName || request.name.toLowerCase().replace(/\s+/g, "-") },
    { icon: Globe, label: "Namespace", value: gitlabConfig?.mappingConfig?.namespace || "default" },
    { icon: BookOpen, label: "Wiki Pages", value: `${request.wikiDraft?.outline.length || 0} pages` },
    { icon: ListTodo, label: "Issues / Epics", value: `${countBacklogItems(request)} items` },
    { icon: Tag, label: "Labels", value: `${payload.labels.length} labels` },
    { icon: Milestone, label: "Milestones", value: `${payload.milestones.length} milestones` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Target + Readiness */}
        <div className="space-y-4">
          {/* Target Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Target PM Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 px-3 py-2.5 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <GitBranch className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">GitLab</p>
                  <p className="text-[11px] text-muted-foreground">Connected</p>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left opacity-40" disabled>
                <div className="h-9 w-9 rounded-md border border-dashed" />
                <div>
                  <p className="text-sm text-muted-foreground">Jira</p>
                  <p className="text-[11px] text-muted-foreground">Coming soon</p>
                </div>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left opacity-40" disabled>
                <div className="h-9 w-9 rounded-md border border-dashed" />
                <div>
                  <p className="text-sm text-muted-foreground">Azure DevOps</p>
                  <p className="text-[11px] text-muted-foreground">Coming soon</p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Readiness Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Readiness</CardTitle>
                <Badge variant={allReady ? "default" : "secondary"} className={allReady ? "bg-green-600 hover:bg-green-600 text-white text-[10px]" : "text-[10px]"}>
                  {readinessChecks.filter((c) => c.ready).length}/{readinessChecks.length} Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {readinessChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2.5 rounded-md border px-3 py-2">
                  {check.ready ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <CircleDot className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${check.ready ? "font-medium" : "text-muted-foreground"}`}>{check.label}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{check.detail}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Mapping Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Mapping Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowPayload(!showPayload)}
                >
                  <FileText className="mr-1.5 h-3 w-3" />
                  {showPayload ? "Hide" : "Show"} Payload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {mappingItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {showPayload && (
                <ScrollArea className="h-[240px] rounded-md border bg-zinc-950 p-4">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-zinc-300">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gate check & Generate */}
      <Card>
        <CardContent className="px-6 py-4">
          {!gateApproved && request.status !== "GENERATED" && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
              <Lock className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Compliance Gate Required
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  The compliance gate must be approved before you can generate.
                </p>
              </div>
            </div>
          )}

          {state === "idle" && canGenerate && (
            <div className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">All checks passed</p>
                  <p className="text-xs text-muted-foreground">Ready to generate project to GitLab</p>
                </div>
              </div>
              <Button size="lg" className="px-6" onClick={handleGenerate}>
                <Rocket className="mr-2 h-4 w-4" />
                Generate to GitLab
              </Button>
            </div>
          )}

          {state === "idle" && gateApproved && request.status !== "GENERATED" && !canGenerate && (
            <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 shrink-0" />
              Only Project Managers or Admins can trigger generation.
            </div>
          )}

          {state === "generating" && (
            <div className="space-y-3 py-3 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium">Generating project in GitLab...</p>
              <Progress value={progress} className="mx-auto max-w-md" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 py-5 dark:border-green-900 dark:bg-green-950/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold">Successfully Generated!</p>
                <p className="text-sm text-muted-foreground">
                  Project has been created in GitLab
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://gitlab.example.com/${gitlabConfig?.mappingConfig?.namespace || "default"}/${gitlabConfig?.mappingConfig?.projectName || "project"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open in GitLab
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export Bundle
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function countBacklogItems(request: OnboardingRequest): number {
  if (!request.backlogDraft) return 0;
  let count = 0;
  const walk = (items: { children?: unknown[] }[]) => {
    for (const item of items) {
      count++;
      if (item.children) walk(item.children as { children?: unknown[] }[]);
    }
  };
  walk(request.backlogDraft.items);
  return count;
}

function buildPayload(request: OnboardingRequest) {
  const gitlabConfig = request.integrations.find((i) => i.targetTool === "gitlab");
  return {
    project: {
      name: gitlabConfig?.mappingConfig?.projectName || request.name.toLowerCase().replace(/\s+/g, "-"),
      namespace: gitlabConfig?.mappingConfig?.namespace || "default",
      description: `Auto-generated from PM Onboarding Platform - ${request.name}`,
    },
    wiki: request.wikiDraft?.outline.map((s) => ({
      title: s.title,
      content: s.content,
    })) || [],
    issues: request.backlogDraft?.items.map((epic) => ({
      type: epic.type,
      title: epic.title,
      description: epic.description,
      labels: epic.labels,
      children: epic.children?.map((feat) => ({
        type: feat.type,
        title: feat.title,
        description: feat.description,
        labels: feat.labels,
      })),
    })) || [],
    labels: extractLabels(request),
    milestones: ["Phase 1", "Phase 2", "Phase 3"],
  };
}

function extractLabels(request: OnboardingRequest): string[] {
  const labels = new Set<string>();
  const walk = (items: { labels: string[]; children?: unknown[] }[]) => {
    for (const item of items) {
      item.labels.forEach((l) => labels.add(l));
      if (item.children) walk(item.children as { labels: string[]; children?: unknown[] }[]);
    }
  };
  if (request.backlogDraft) walk(request.backlogDraft.items);
  return Array.from(labels);
}
