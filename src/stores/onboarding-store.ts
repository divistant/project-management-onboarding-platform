import { create } from "zustand";
import type {
  OnboardingRequest,
  OnboardingStatus,
  ReviewComment,
  AuditEvent,
  WikiSection,
  BacklogItem,
  ChecklistItem,
  GateStatus,
  Approval,
  PipelineStep,
  ProjectDocument,
  PipelineStepStatus,
  ArtifactApproval,
  ArtifactType,
  Compliance,
} from "@/types/onboarding";
import { SEED_ONBOARDING, SEED_COMMENTS } from "@/mocks/seed-data";

interface OnboardingState {
  requests: OnboardingRequest[];
  comments: ReviewComment[];

  getRequest: (id: string) => OnboardingRequest | undefined;
  createRequest: (data: Partial<OnboardingRequest>) => OnboardingRequest;
  updateRequest: (id: string, data: Partial<OnboardingRequest>) => void;
  updateStatus: (id: string, status: OnboardingStatus) => void;

  addDocument: (requestId: string, doc: ProjectDocument) => void;
  removeDocument: (requestId: string, docId: string) => void;

  startPipeline: (requestId: string) => void;
  updatePipelineStep: (requestId: string, stepId: string, status: PipelineStepStatus) => void;

  updateWikiSection: (requestId: string, sectionId: string, content: string) => void;
  addWikiSection: (requestId: string, section: WikiSection) => void;
  reorderWikiSections: (requestId: string, sections: WikiSection[]) => void;

  updateBacklogItem: (requestId: string, itemId: string, data: Partial<BacklogItem>) => void;
  addBacklogItem: (requestId: string, parentId: string | null, item: BacklogItem) => void;

  updateChecklist: (requestId: string, checklistId: string, checked: boolean) => void;
  updateChecklistEvidence: (requestId: string, checklistId: string, evidenceUrl: string, notes: string) => void;
  switchComplianceTemplate: (requestId: string, compliance: Compliance) => void;
  submitGate: (requestId: string) => void;
  approveGate: (requestId: string, approval: Approval) => void;

  duplicateRequest: (requestId: string) => OnboardingRequest | undefined;
  archiveRequest: (requestId: string) => void;

  setArtifactApproval: (requestId: string, approval: ArtifactApproval) => void;
  assignReviewer: (requestId: string, artifact: ArtifactType, userId: string, userName: string) => void;

  addComment: (comment: ReviewComment) => void;
  addAuditEvent: (event: AuditEvent) => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function updateBacklogItemInTree(
  items: BacklogItem[],
  itemId: string,
  data: Partial<BacklogItem>
): BacklogItem[] {
  return items.map((item) => {
    if (item.id === itemId) return { ...item, ...data };
    if (item.children) {
      return { ...item, children: updateBacklogItemInTree(item.children, itemId, data) };
    }
    return item;
  });
}

function addBacklogItemToTree(
  items: BacklogItem[],
  parentId: string | null,
  newItem: BacklogItem
): BacklogItem[] {
  if (!parentId) return [...items, newItem];
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children || []), newItem] };
    }
    if (item.children) {
      return { ...item, children: addBacklogItemToTree(item.children, parentId, newItem) };
    }
    return item;
  });
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  requests: [...SEED_ONBOARDING],
  comments: [...SEED_COMMENTS],

  getRequest: (id) => get().requests.find((r) => r.id === id),

  createRequest: (data) => {
    const newReq: OnboardingRequest = {
      id: generateId("onb"),
      name: data.name || "Untitled Project",
      owner: data.owner || "",
      ownerId: data.ownerId || "",
      org: data.org || "",
      category: data.category || "Internal",
      confidentiality: data.confidentiality || "Internal",
      status: "DRAFT",
      targetTool: data.targetTool || "gitlab",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      pipeline: [],
      integrations: [{ targetTool: "gitlab", enabled: true }],
      auditLog: [],
      ...data,
    } as OnboardingRequest;
    set((s) => ({ requests: [...s.requests, newReq] }));
    return newReq;
  },

  updateRequest: (id, data) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      ),
    })),

  updateStatus: (id, status) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      ),
    })),

  addDocument: (requestId, doc) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId
          ? { ...r, documents: [...r.documents, doc], updatedAt: new Date().toISOString() }
          : r
      ),
    })),

  removeDocument: (requestId, docId) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId
          ? { ...r, documents: r.documents.filter((d) => d.id !== docId), updatedAt: new Date().toISOString() }
          : r
      ),
    })),

  startPipeline: (requestId) => {
    const steps: PipelineStep[] = [
      { id: "step-1", name: "Extract", description: "Convert PDF/DOCX to Markdown", status: "queued" },
      { id: "step-2", name: "Enrichment", description: "Generate wiki outline & backlog draft", status: "queued" },
      { id: "step-3", name: "Quality/Verify", description: "Validate completeness", status: "queued" },
      { id: "step-4", name: "Mapping/Compliance", description: "Map to compliance template", status: "queued" },
    ];
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId
          ? { ...r, pipeline: steps, status: "PROCESSING" as const, updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  },

  updatePipelineStep: (requestId, stepId, status) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              pipeline: r.pipeline.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      status,
                      ...(status === "running" ? { startedAt: new Date().toISOString() } : {}),
                      ...(status === "success" || status === "fail"
                        ? { completedAt: new Date().toISOString() }
                        : {}),
                    }
                  : step
              ),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    })),

  updateWikiSection: (requestId, sectionId, content) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.wikiDraft) return r;
        return {
          ...r,
          wikiDraft: {
            ...r.wikiDraft,
            outline: r.wikiDraft.outline.map((sec) =>
              sec.id === sectionId ? { ...sec, content } : sec
            ),
            lastEditedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  addWikiSection: (requestId, section) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.wikiDraft) return r;
        return {
          ...r,
          wikiDraft: {
            ...r.wikiDraft,
            outline: [...r.wikiDraft.outline, section],
            lastEditedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  reorderWikiSections: (requestId, sections) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.wikiDraft) return r;
        return {
          ...r,
          wikiDraft: { ...r.wikiDraft, outline: sections, lastEditedAt: new Date().toISOString() },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  updateBacklogItem: (requestId, itemId, data) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.backlogDraft) return r;
        return {
          ...r,
          backlogDraft: {
            ...r.backlogDraft,
            items: updateBacklogItemInTree(r.backlogDraft.items, itemId, data),
            lastEditedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  addBacklogItem: (requestId, parentId, item) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.backlogDraft) return r;
        return {
          ...r,
          backlogDraft: {
            ...r.backlogDraft,
            items: addBacklogItemToTree(r.backlogDraft.items, parentId, item),
            lastEditedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  updateChecklist: (requestId, checklistId, checked) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.compliance) return r;
        return {
          ...r,
          compliance: {
            ...r.compliance,
            checklist: r.compliance.checklist.map((c: ChecklistItem) =>
              c.id === checklistId ? { ...c, checked } : c
            ),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  submitGate: (requestId) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.compliance) return r;
        return {
          ...r,
          compliance: { ...r.compliance, gateStatus: "pending" as GateStatus },
          status: "GATE_PENDING" as const,
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  approveGate: (requestId, approval) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.compliance) return r;
        const newApprovals = [...r.compliance.approvals, approval];
        const isApproved = approval.action === "approve";
        const isRejected = approval.action === "request_changes";
        return {
          ...r,
          compliance: {
            ...r.compliance,
            approvals: newApprovals,
            gateStatus: (isApproved ? "approved" : isRejected ? "rejected" : r.compliance.gateStatus) as GateStatus,
          },
          status: isApproved ? ("READY_TO_GENERATE" as const) : isRejected ? ("REVIEW" as const) : r.status,
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  updateChecklistEvidence: (requestId, checklistId, evidenceUrl, notes) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId || !r.compliance) return r;
        return {
          ...r,
          compliance: {
            ...r.compliance,
            checklist: r.compliance.checklist.map((c: ChecklistItem) =>
              c.id === checklistId ? { ...c, evidenceUrl, notes } : c
            ),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  switchComplianceTemplate: (requestId, compliance) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, compliance, updatedAt: new Date().toISOString() } : r
      ),
    })),

  duplicateRequest: (requestId) => {
    const state = get();
    const original = state.requests.find((r) => r.id === requestId);
    if (!original) return undefined;
    const newReq: OnboardingRequest = {
      ...original,
      id: generateId("onb"),
      name: `${original.name} (Copy)`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pipeline: [],
      wikiDraft: undefined,
      backlogDraft: undefined,
      compliance: undefined,
      auditLog: [],
      archived: false,
    };
    set((s) => ({ requests: [...s.requests, newReq] }));
    return newReq;
  },

  archiveRequest: (requestId) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === requestId ? { ...r, archived: true, updatedAt: new Date().toISOString() } : r
      ),
    })),

  setArtifactApproval: (requestId, approval) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId) return r;
        const existing = r.artifactApprovals || [];
        const filtered = existing.filter((a) => a.artifact !== approval.artifact);
        return { ...r, artifactApprovals: [...filtered, approval], updatedAt: new Date().toISOString() };
      }),
    })),

  assignReviewer: (requestId, artifact, userId, userName) =>
    set((s) => ({
      requests: s.requests.map((r) => {
        if (r.id !== requestId) return r;
        const existing = r.reviewers || [];
        const filtered = existing.filter((rv) => rv.artifact !== artifact);
        return { ...r, reviewers: [...filtered, { artifact, userId, userName }], updatedAt: new Date().toISOString() };
      }),
    })),

  addComment: (comment) =>
    set((s) => ({ comments: [...s.comments, comment] })),

  addAuditEvent: (event) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === event.onboardingId
          ? { ...r, auditLog: [...r.auditLog, event] }
          : r
      ),
    })),
}));
