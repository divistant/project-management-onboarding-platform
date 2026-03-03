"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Globe,
  FileText,
  X,
  CheckCircle2,
  Folder,
  FolderOpen,
} from "lucide-react";
import type {
  Category,
  Confidentiality,
  DocumentType,
  ProjectDocument,
} from "@/types/onboarding";

type WizardStep = 1 | 2 | 3;

interface BasicInfo {
  name: string;
  org: string;
  category: Category;
  targetTool: string;
  confidentiality: Confidentiality;
}

interface PendingDocument {
  id: string;
  name: string;
  type: DocumentType;
  source: "upload" | "sharepoint";
  size: number;
}

interface SharePointFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: DocumentType;
}

const SHAREPOINT_TREE: { folder: string; files: SharePointFile[] }[] = [
  {
    folder: "Projects/Core Banking",
    files: [
      { id: "sp-1", name: "FSD_TechnicalSpec_v1.pdf", path: "Projects/Core Banking/FSD_TechnicalSpec_v1.pdf", size: 3200000, type: "FSD" },
      { id: "sp-2", name: "BRD_CoreBanking_v3.pdf", path: "Projects/Core Banking/BRD_CoreBanking_v3.pdf", size: 2100000, type: "BRD" },
    ],
  },
  {
    folder: "Projects/Mobile Wallet",
    files: [
      { id: "sp-3", name: "PRD_MobilePayment_v2.docx", path: "Projects/Mobile Wallet/PRD_MobilePayment_v2.docx", size: 1800000, type: "PRD" },
    ],
  },
  {
    folder: "Templates",
    files: [
      { id: "sp-4", name: "Standard_BRD_Template.docx", path: "Templates/Standard_BRD_Template.docx", size: 500000, type: "Other" },
    ],
  },
];

export default function NewOnboardingPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { createRequest, addDocument, startPipeline, addAuditEvent } = useOnboardingStore();

  const [step, setStep] = useState<WizardStep>(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: "",
    org: "",
    category: "Internal",
    targetTool: "gitlab",
    confidentiality: "Internal",
  });
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [spDialogOpen, setSpDialogOpen] = useState(false);
  const [spSelected, setSpSelected] = useState<Set<string>>(new Set());
  const [spExpandedFolders, setSpExpandedFolders] = useState<Set<string>>(new Set());

  const canProceedStep1 = basicInfo.name.trim().length > 0 && basicInfo.org.trim().length > 0;
  const canProceedStep2 = pendingDocs.length > 0;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!basicInfo.name.trim()) e.name = "Project name is required";
    if (!basicInfo.org.trim()) e.org = "Organization is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.docx,.xlsx,.doc,.xls";
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      const newDocs: PendingDocument[] = Array.from(files).map((f) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: f.name,
        type: guessDocType(f.name),
        source: "upload" as const,
        size: f.size,
      }));
      setPendingDocs((prev) => [...prev, ...newDocs]);
    };
    input.click();
  }, []);

  const handleSharePointConfirm = () => {
    const allFiles = SHAREPOINT_TREE.flatMap((f) => f.files);
    const selectedFiles = allFiles.filter((f) => spSelected.has(f.id));
    const newDocs: PendingDocument[] = selectedFiles.map((f) => ({
      id: `doc-sp-${f.id}-${Date.now()}`,
      name: f.name,
      type: f.type,
      source: "sharepoint" as const,
      size: f.size,
    }));
    setPendingDocs((prev) => [...prev, ...newDocs]);
    setSpDialogOpen(false);
    setSpSelected(new Set());
  };

  const toggleSpFile = (id: string) => {
    setSpSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSpFolder = (folder: string) => {
    setSpExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(folder) ? next.delete(folder) : next.add(folder);
      return next;
    });
  };

  const removeDoc = useCallback((id: string) => {
    setPendingDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateDocType = useCallback((id: string, type: DocumentType) => {
    setPendingDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, type } : d))
    );
  }, []);

  const handleStartProcessing = useCallback(() => {
    const req = createRequest({
      name: basicInfo.name,
      owner: currentUser.name,
      ownerId: currentUser.id,
      org: basicInfo.org,
      category: basicInfo.category,
      confidentiality: basicInfo.confidentiality,
      targetTool: basicInfo.targetTool,
    });

    addAuditEvent({
      id: `aud-${Date.now()}`,
      onboardingId: req.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "create",
      detail: `Onboarding request "${req.name}" created`,
      timestamp: new Date().toISOString(),
    });

    pendingDocs.forEach((pd) => {
      const doc: ProjectDocument = {
        id: pd.id,
        name: pd.name,
        type: pd.type,
        source: pd.source,
        url: `/files/${pd.name}`,
        uploadDate: new Date().toISOString(),
        owner: currentUser.id,
        size: pd.size,
        extractedMarkdown: generateMockMarkdown(pd.type),
      };
      addDocument(req.id, doc);
      addAuditEvent({
        id: `aud-${Date.now()}-${pd.id}`,
        onboardingId: req.id,
        userId: currentUser.id,
        userName: currentUser.name,
        action: "upload",
        detail: `Uploaded ${pd.name}`,
        timestamp: new Date().toISOString(),
      });
    });

    startPipeline(req.id);
    addAuditEvent({
      id: `aud-proc-${Date.now()}`,
      onboardingId: req.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "process",
      detail: "Started processing pipeline",
      timestamp: new Date().toISOString(),
    });

    setStep(3);
    setTimeout(() => {
      router.push(`/workspace/${req.id}`);
    }, 1500);
  }, [basicInfo, pendingDocs, currentUser, createRequest, addDocument, startPipeline, addAuditEvent, router]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/onboarding")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">New Onboarding</h1>
        </div>

        <div className="flex items-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={`text-sm ${step >= s ? "font-medium" : "text-muted-foreground"}`}>
                  {s === 1 ? "Basic Info" : s === 2 ? "Documents" : "Process"}
                </span>
              </div>
              {s < 3 && <div className="mx-3 h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Core Banking Modernization"
                  value={basicInfo.name}
                  onChange={(e) => { setBasicInfo((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); }}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="org">Client / Organization *</Label>
                <Input
                  id="org"
                  placeholder="e.g. PT Bank Nusantara"
                  value={basicInfo.org}
                  onChange={(e) => { setBasicInfo((p) => ({ ...p, org: e.target.value })); setErrors((p) => ({ ...p, org: "" })); }}
                  aria-invalid={!!errors.org}
                />
                {errors.org && <p className="text-xs text-destructive">{errors.org}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={basicInfo.category} onValueChange={(v) => setBasicInfo((p) => ({ ...p, category: v as Category }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target PM Tool</Label>
                  <Select value={basicInfo.targetTool} onValueChange={(v) => setBasicInfo((p) => ({ ...p, targetTool: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gitlab">GitLab</SelectItem>
                      <SelectItem value="jira" disabled>Jira (coming soon)</SelectItem>
                      <SelectItem value="azure_devops" disabled>Azure DevOps (coming soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confidentiality</Label>
                <Select value={basicInfo.confidentiality} onValueChange={(v) => setBasicInfo((p) => ({ ...p, confidentiality: v as Confidentiality }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { if (validateStep1()) setStep(2); }} disabled={!canProceedStep1}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Document Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleFileSelect}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-muted"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Upload Files</span>
                  <span className="text-xs text-muted-foreground">PDF, DOCX, XLSX</span>
                </button>
                <button
                  onClick={() => setSpDialogOpen(true)}
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-muted"
                >
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Connect SharePoint</span>
                  <span className="text-xs text-muted-foreground">Browse folders</span>
                </button>
              </div>

              {pendingDocs.length > 0 && (
                <div className="space-y-2">
                  <Label>Documents ({pendingDocs.length})</Label>
                  {pendingDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-md border p-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.size / 1024 / 1024).toFixed(1)} MB &middot;{" "}
                          {doc.source === "sharepoint" ? "SharePoint" : "Upload"}
                        </p>
                      </div>
                      <Select value={doc.type} onValueChange={(v) => updateDocType(doc.id, v as DocumentType)}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRD">BRD</SelectItem>
                          <SelectItem value="PRD">PRD</SelectItem>
                          <SelectItem value="FSD">FSD</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => removeDoc(doc.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleStartProcessing} disabled={!canProceedStep2}>
                  Run Extract & Enrich <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Started</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Pipeline started. Redirecting to workspace...
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={spDialogOpen} onOpenChange={setSpDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Browse SharePoint (Mock)</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {SHAREPOINT_TREE.map((group) => (
                <div key={group.folder}>
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                    onClick={() => toggleSpFolder(group.folder)}
                  >
                    {spExpandedFolders.has(group.folder) ? (
                      <FolderOpen className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Folder className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="font-medium">{group.folder}</span>
                  </button>
                  {spExpandedFolders.has(group.folder) && (
                    <div className="ml-6 space-y-0.5">
                      {group.files.map((file) => (
                        <label
                          key={file.id}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={spSelected.has(file.id)}
                            onCheckedChange={() => toggleSpFile(file.id)}
                          />
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSpDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSharePointConfirm} disabled={spSelected.size === 0}>
              Add {spSelected.size} file(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function guessDocType(filename: string): DocumentType {
  const lower = filename.toLowerCase();
  if (lower.includes("brd")) return "BRD";
  if (lower.includes("prd")) return "PRD";
  if (lower.includes("fsd") || lower.includes("tech")) return "FSD";
  return "Other";
}

function generateMockMarkdown(type: DocumentType): string {
  const templates: Record<DocumentType, string> = {
    BRD: "# Business Requirements Document\n\n## Executive Summary\nThis document outlines the business requirements for the project.\n\n## Business Goals\n- Improve operational efficiency by 40%\n- Reduce manual processes\n- Enable real-time data access\n\n## Scope\n### In Scope\n- Core module development\n- Integration with existing systems\n- User training and documentation\n\n### Out of Scope\n- Mobile application (Phase 2)\n- Third-party marketplace\n\n## Requirements\n### Functional Requirements\n- FR-001: User authentication and authorization\n- FR-002: Data import/export capabilities\n- FR-003: Real-time dashboard\n- FR-004: Automated reporting\n\n### Non-Functional Requirements\n- NFR-001: 99.9% uptime SLA\n- NFR-002: < 500ms response time\n- NFR-003: SOC2 compliance\n\n## Assumptions\n- Infrastructure is pre-provisioned\n- API gateway is already in place\n- Team has required skill set\n\n## Risks\n- Data migration complexity\n- Regulatory changes during development\n- Resource availability constraints",
    PRD: "# Product Requirements Document\n\n## Overview\nProduct overview describing the solution and its value proposition.\n\n## User Personas\n- End User: Daily operations\n- Manager: Oversight and reporting\n- Administrator: System configuration\n\n## Features\n### Feature 1: User Management\n- User registration and onboarding\n- Role-based access control\n- Profile management\n\n### Feature 2: Data Processing\n- Automated data ingestion\n- Validation and transformation\n- Real-time processing pipeline\n\n### Feature 3: Reporting & Analytics\n- Customizable dashboards\n- Scheduled reports\n- Export to PDF/Excel",
    FSD: "# Functional Specification Document\n\n## System Architecture\nMicroservices-based architecture with event-driven communication.\n\n## API Specifications\n### POST /api/v1/resources\nCreate a new resource with validation.\n\n### GET /api/v1/resources/:id\nRetrieve resource details.\n\n## Data Model\n### Entity: Resource\n- id: UUID\n- name: string\n- status: enum\n- created_at: timestamp\n\n## Security\n- JWT-based authentication\n- Role-based authorization\n- Data encryption at rest and in transit",
    Other: "# Document\n\nExtracted content from the uploaded document.\n\n## Section 1\nContent details...\n\n## Section 2\nAdditional information...",
  };
  return templates[type];
}
