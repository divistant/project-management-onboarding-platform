"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STATUS_CONFIG } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

import { PipelineView } from "./pipeline-view";
import { DocumentsView } from "./documents-view";
import { ExtractedContentView } from "./extracted-content-view";
import { WikiDraftView } from "./wiki-draft-view";
import { BacklogDraftView } from "./backlog-draft-view";
import { ComplianceView } from "./compliance-view";
import { ReviewApprovalsView } from "./review-approvals-view";
import { GenerateView } from "./generate-view";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const request = useOnboardingStore((s) => s.getRequest(id));
  const currentUser = useAuthStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState("documents");

  const simulatePipeline = useSimulatePipeline(id);

  useEffect(() => {
    if (request?.status === "PROCESSING") {
      simulatePipeline();
    }
  }, [request?.status, simulatePipeline]);

  if (!request) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Onboarding request not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/onboarding")}>
            Back to list
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[request.status];

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push("/onboarding")} title="Back to list">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{request.name}</h1>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {request.owner} &middot; {request.org} &middot; {request.confidentiality}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-4 items-start">
          {/* Left: Main tabbed content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-nowrap overflow-x-auto scrollbar-hide w-full justify-start">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="extracted">Extracted Content</TabsTrigger>
              <TabsTrigger value="wiki" disabled={!request.wikiDraft}>
                Wiki Draft
              </TabsTrigger>
              <TabsTrigger value="backlog" disabled={!request.backlogDraft}>
                Backlog Draft
              </TabsTrigger>
              <TabsTrigger value="compliance" disabled={!request.compliance}>
                Compliance
              </TabsTrigger>
              <TabsTrigger value="review">Review & Approvals</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <DocumentsView request={request} />
            </TabsContent>
            <TabsContent value="extracted">
              <ExtractedContentView request={request} />
            </TabsContent>
            <TabsContent value="wiki">
              <WikiDraftView request={request} currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="backlog">
              <BacklogDraftView request={request} currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="compliance">
              <ComplianceView request={request} currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="review">
              <ReviewApprovalsView request={request} currentUser={currentUser} />
            </TabsContent>
            <TabsContent value="generate">
              <GenerateView request={request} currentUser={currentUser} />
            </TabsContent>
          </Tabs>

          {/* Right: Pipeline panel (always visible) */}
          <div className="sticky top-4">
            <PipelineView request={request} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function useSimulatePipeline(requestId: string) {
  const { updatePipelineStep, updateStatus, updateRequest } = useOnboardingStore();

  return useCallback(() => {
    const steps = ["step-1", "step-2", "step-3", "step-4"];
    const delays = [500, 1500, 2500, 3500];

    steps.forEach((stepId, i) => {
      setTimeout(() => updatePipelineStep(requestId, stepId, "running"), delays[i]);
      setTimeout(() => updatePipelineStep(requestId, stepId, "success"), delays[i] + 800);
    });

    setTimeout(() => {
      const store = useOnboardingStore.getState();
      const req = store.getRequest(requestId);
      if (!req) return;

      const hasWiki = !!req.wikiDraft;
      const hasBacklog = !!req.backlogDraft;

      const updates: Record<string, unknown> = { status: "REVIEW" };
      if (!hasWiki) {
        updates.wikiDraft = generateMockWiki();
      }
      if (!hasBacklog) {
        updates.backlogDraft = generateMockBacklog();
      }
      if (!req.compliance) {
        updates.compliance = generateMockCompliance();
      }

      updateRequest(requestId, updates);
      updateStatus(requestId, "REVIEW");
    }, 4500);
  }, [requestId, updatePipelineStep, updateStatus, updateRequest]);
}

function generateMockWiki() {
  return {
    outline: [
      { id: "ws-new-1", title: "Overview", content: "# Project Overview\n\nProject overview generated from uploaded documents.", sourceRefs: ["BRD" as const], order: 0 },
      { id: "ws-new-2", title: "Business Goals", content: "# Business Goals\n\n1. Primary business goal\n2. Secondary business goal", sourceRefs: ["BRD" as const], order: 1 },
      { id: "ws-new-3", title: "Functional Scope", content: "# Functional Scope\n\n## In Scope\n- Feature A\n- Feature B\n\n## Out of Scope\n- Feature C (future phase)", sourceRefs: ["BRD" as const, "PRD" as const], order: 2 },
      { id: "ws-new-4", title: "Non-Functional Requirements", content: "# NFRs\n\n- Performance: < 500ms response\n- Availability: 99.9% uptime", sourceRefs: ["BRD" as const], order: 3 },
      { id: "ws-new-5", title: "Assumptions", content: "# Assumptions\n\n- Infrastructure ready\n- Team available", sourceRefs: ["BRD" as const], order: 4 },
      { id: "ws-new-6", title: "Risks", content: "# Risks\n\n- Timeline risk\n- Resource risk", sourceRefs: ["BRD" as const], order: 5 },
    ],
    lastEditedBy: "system",
    lastEditedAt: new Date().toISOString(),
  };
}

function generateMockBacklog() {
  return {
    items: [
      {
        id: "epic-new-1", type: "epic" as const, title: "Project MVP", description: "Deliver minimum viable product with all core functionalities",
        priority: "High" as const, estimate: "3 months", labels: ["mvp", "core"], acceptanceCriteria: ["All core features working", "UAT sign-off obtained", "Deployment to staging successful"], dependencies: [],
        children: [
          {
            id: "feat-new-1", type: "feature" as const, title: "User Management", description: "Authentication, authorization, and user profile management",
            priority: "High" as const, estimate: "4 weeks", labels: ["auth", "core"], acceptanceCriteria: ["Login/logout working", "Role-based access enforced", "Profile CRUD complete"],
            dependencies: [],
            children: [
              {
                id: "story-new-1", type: "story" as const, title: "As a user, I can register and create an account", description: "User registration with email verification",
                priority: "High" as const, estimate: "3d", labels: ["auth"], acceptanceCriteria: ["Registration form validates inputs", "Email verification sent", "Account created on confirmation"], dependencies: []
              },
              {
                id: "story-new-2", type: "story" as const, title: "As a user, I can login with credentials", description: "Secure login with JWT tokens",
                priority: "High" as const, estimate: "2d", labels: ["auth"], acceptanceCriteria: ["JWT token issued on login", "Invalid credentials show error", "Session persists across refreshes"], dependencies: ["story-new-1"]
              },
              {
                id: "task-new-1", type: "task" as const, title: "Setup authentication middleware", description: "Configure JWT middleware for API routes",
                priority: "High" as const, estimate: "1d", labels: ["backend", "auth"], acceptanceCriteria: ["Middleware rejects unauthorized requests"], dependencies: []
              },
              {
                id: "task-new-2", type: "task" as const, title: "Create user profile UI components", description: "Build profile view and edit components",
                priority: "Medium" as const, estimate: "2d", labels: ["frontend"], acceptanceCriteria: ["Profile displays user info", "Edit form saves changes"], dependencies: []
              },
            ],
          },
          {
            id: "feat-new-2", type: "feature" as const, title: "Data Processing Pipeline", description: "Automated data ingestion, validation, and transformation",
            priority: "Critical" as const, estimate: "5 weeks", labels: ["pipeline", "core"], acceptanceCriteria: ["Data ingested from all sources", "Validation catches 99% of errors", "Transformation runs under 5 minutes"],
            dependencies: ["feat-new-1"],
            children: [
              {
                id: "story-new-3", type: "story" as const, title: "As an operator, I can upload data files for processing", description: "File upload with format validation",
                priority: "Critical" as const, estimate: "3d", labels: ["upload", "pipeline"], acceptanceCriteria: ["Supports CSV, JSON, XML formats", "File size limit enforced", "Upload progress shown"], dependencies: []
              },
              {
                id: "story-new-4", type: "story" as const, title: "System automatically validates uploaded data", description: "Automated validation rules engine",
                priority: "High" as const, estimate: "5d", labels: ["validation", "pipeline"], acceptanceCriteria: ["Schema validation passes", "Business rules checked", "Validation report generated"], dependencies: ["story-new-3"]
              },
              {
                id: "task-new-3", type: "task" as const, title: "Implement data transformation engine", description: "Build ETL pipeline for data normalization",
                priority: "High" as const, estimate: "5d", labels: ["backend", "etl"], acceptanceCriteria: ["Transforms complete within SLA", "Error handling for malformed data"], dependencies: []
              },
            ],
          },
          {
            id: "feat-new-3", type: "feature" as const, title: "Reporting Dashboard", description: "Real-time dashboards with customizable widgets",
            priority: "High" as const, estimate: "4 weeks", labels: ["reporting", "dashboard"], acceptanceCriteria: ["Dashboard loads under 2 seconds", "Widgets are configurable", "Export to PDF/Excel supported"],
            dependencies: ["feat-new-2"],
            children: [
              {
                id: "story-new-5", type: "story" as const, title: "As a manager, I can view real-time KPI dashboard", description: "Dashboard with live metrics and charts",
                priority: "High" as const, estimate: "4d", labels: ["dashboard"], acceptanceCriteria: ["KPIs update in real-time", "Charts are interactive"], dependencies: []
              },
              {
                id: "task-new-4", type: "task" as const, title: "Create chart components library", description: "Reusable chart components using charting library",
                priority: "Medium" as const, estimate: "3d", labels: ["frontend", "charts"], acceptanceCriteria: ["Line, bar, pie charts available"], dependencies: []
              },
              {
                id: "task-new-5", type: "task" as const, title: "Implement report export service", description: "PDF and Excel export for dashboard data",
                priority: "Medium" as const, estimate: "2d", labels: ["backend", "export"], acceptanceCriteria: ["PDF export renders correctly", "Excel contains all data"], dependencies: []
              },
            ],
          },
        ],
      },
    ],
    lastEditedBy: "system",
    lastEditedAt: new Date().toISOString(),
  };
}

function generateMockCompliance() {
  return {
    templateId: "tpl-internal",
    templateName: "Internal Standard",
    riskLevel: "Medium" as const,
    checklist: [
      { id: "chk-new-1", section: "Documentation", label: "BRD document uploaded and reviewed", checked: true },
      { id: "chk-new-2", section: "Documentation", label: "PRD document uploaded and reviewed", checked: false },
      { id: "chk-new-3", section: "Documentation", label: "Technical architecture documented", checked: false },
      { id: "chk-new-4", section: "Security", label: "Security threat model documented", checked: false },
      { id: "chk-new-5", section: "Security", label: "Data encryption requirements defined", checked: false },
      { id: "chk-new-6", section: "Security", label: "Authentication design reviewed", checked: false },
      { id: "chk-new-7", section: "Data Handling", label: "PII data handling procedures defined", checked: false },
      { id: "chk-new-8", section: "Data Handling", label: "Data retention policy documented", checked: false },
      { id: "chk-new-9", section: "Approval", label: "Architecture review completed", checked: false },
      { id: "chk-new-10", section: "Approval", label: "Stakeholder sign-off obtained", checked: false },
    ],
    gateStatus: "not_submitted" as const,
    approvals: [],
  };
}
