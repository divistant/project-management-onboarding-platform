export type OnboardingStatus =
  | "DRAFT"
  | "PROCESSING"
  | "REVIEW"
  | "GATE_PENDING"
  | "READY_TO_GENERATE"
  | "GENERATED"
  | "FAILED";

export type UserRole = "pm" | "compliance" | "tech_lead" | "admin";

export type DocumentType = "BRD" | "PRD" | "FSD" | "Other";

export type DocumentSource = "upload" | "sharepoint";

export type RiskLevel = "Low" | "Medium" | "High";

export type GateStatus = "not_submitted" | "pending" | "approved" | "rejected";

export type ApprovalAction = "approve" | "request_changes";

export type Confidentiality = "Public" | "Internal" | "Restricted";

export type Category = "Internal" | "Client";

export type PipelineStepStatus = "queued" | "running" | "success" | "fail";

export type UserStatus = "active" | "inactive" | "invited";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  department: string;
  lastLogin: string | null;
  createdAt: string;
  invitedBy?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  source: DocumentSource;
  url: string;
  uploadDate: string;
  owner: string;
  extractedMarkdown?: string;
  size?: number;
}

export interface WikiSection {
  id: string;
  title: string;
  content: string;
  sourceRefs: DocumentType[];
  order: number;
  children?: WikiSection[];
}

export interface WikiDraft {
  outline: WikiSection[];
  lastEditedBy: string;
  lastEditedAt: string;
}

export interface BacklogItem {
  id: string;
  type: "epic" | "feature" | "story" | "task";
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  estimate?: string;
  labels: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  milestone?: string;
  children?: BacklogItem[];
  completenessScore?: number;
  issues?: string[];
}

export interface BacklogDraft {
  items: BacklogItem[];
  lastEditedBy: string;
  lastEditedAt: string;
}

export interface ChecklistItem {
  id: string;
  section: string;
  label: string;
  checked: boolean;
  evidence?: string;
  notes?: string;
  evidenceUrl?: string;
}

export type ArtifactType = "wiki" | "backlog" | "compliance";

export interface ArtifactApproval {
  artifact: ArtifactType;
  status: "pending" | "approved" | "changes_requested";
  reviewerId?: string;
  reviewerName?: string;
  comment?: string;
  timestamp?: string;
}

export interface Approval {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: ApprovalAction | "pending";
  comment?: string;
  timestamp: string;
}

export interface Compliance {
  templateId: string;
  templateName: string;
  riskLevel: RiskLevel;
  checklist: ChecklistItem[];
  gateStatus: GateStatus;
  approvals: Approval[];
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: PipelineStepStatus;
  logs?: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface AuditEvent {
  id: string;
  onboardingId: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface IntegrationConfig {
  targetTool: "gitlab" | "jira" | "azure_devops" | "trello";
  enabled: boolean;
  mappingConfig?: {
    projectName?: string;
    namespace?: string;
  };
}

export interface OnboardingRequest {
  id: string;
  name: string;
  owner: string;
  ownerId: string;
  org: string;
  category: Category;
  confidentiality: Confidentiality;
  status: OnboardingStatus;
  targetTool: string;
  createdAt: string;
  updatedAt: string;
  documents: ProjectDocument[];
  pipeline: PipelineStep[];
  wikiDraft?: WikiDraft;
  backlogDraft?: BacklogDraft;
  compliance?: Compliance;
  integrations: IntegrationConfig[];
  auditLog: AuditEvent[];
  archived?: boolean;
  artifactApprovals?: ArtifactApproval[];
  reviewers?: { artifact: ArtifactType; userId: string; userName: string }[];
}

export interface ReviewComment {
  id: string;
  onboardingId: string;
  artifact: "wiki" | "backlog" | "compliance";
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}
