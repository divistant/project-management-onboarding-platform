"use client";

import { useState } from "react";
import type { OnboardingRequest, User, RiskLevel, Compliance } from "@/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { COMPLIANCE_TEMPLATES } from "@/mocks/seed-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, ShieldAlert, MessageSquare, Link2, Plus } from "lucide-react";

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const GATE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  not_submitted: { label: "Awaiting Submission", variant: "secondary" },
  pending: { label: "Pending Review", variant: "outline" },
  approved: { label: "Approved", variant: "default", className: "bg-green-600 hover:bg-green-600 text-white" },
  rejected: { label: "Changes Requested", variant: "destructive" },
};

export function ComplianceView({
  request,
  currentUser,
}: {
  request: OnboardingRequest;
  currentUser: User;
}) {
  const { updateChecklist, updateChecklistEvidence, switchComplianceTemplate, submitGate, approveGate, addAuditEvent } =
    useOnboardingStore();
  const [rejectComment, setRejectComment] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [evidenceDialogItem, setEvidenceDialogItem] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");

  if (!request.compliance) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Compliance data not available. Run the processing pipeline first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const compliance = request.compliance;
  const sections = Array.from(new Set(compliance.checklist.map((c) => c.section)));
  const checkedCount = compliance.checklist.filter((c) => c.checked).length;
  const totalChecklist = compliance.checklist.length;
  const gateBadge = GATE_BADGE[compliance.gateStatus];

  const canSubmitGate = (currentUser.role === "pm" || currentUser.role === "admin") && compliance.gateStatus === "not_submitted";
  const canResubmit = (currentUser.role === "pm" || currentUser.role === "admin") && compliance.gateStatus === "rejected";
  const canApprove =
    (currentUser.role === "compliance" || currentUser.role === "tech_lead" || currentUser.role === "admin") &&
    compliance.gateStatus === "pending";

  const handleTemplateChange = (templateId: string) => {
    const tpl = COMPLIANCE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const newCompliance: Compliance = {
      templateId: tpl.id,
      templateName: tpl.name,
      riskLevel: compliance.riskLevel,
      checklist: tpl.checklist.map((c) => ({ ...c, checked: false })),
      gateStatus: "not_submitted",
      approvals: [],
    };
    switchComplianceTemplate(request.id, newCompliance);
    addAuditEvent({
      id: `aud-tpl-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "edit",
      detail: `Switched compliance template to "${tpl.name}"`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSubmit = () => {
    submitGate(request.id);
    addAuditEvent({
      id: `aud-gate-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "submit",
      detail: "Submitted compliance gate for review",
      timestamp: new Date().toISOString(),
    });
  };

  const handleApprove = () => {
    approveGate(request.id, {
      id: `apr-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action: "approve",
      comment: "Approved. All requirements met.",
      timestamp: new Date().toISOString(),
    });
    addAuditEvent({
      id: `aud-approve-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "approve",
      detail: `Compliance gate approved by ${currentUser.name}`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleReject = () => {
    if (!rejectComment.trim()) return;
    approveGate(request.id, {
      id: `apr-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action: "request_changes",
      comment: rejectComment,
      timestamp: new Date().toISOString(),
    });
    addAuditEvent({
      id: `aud-reject-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "reject",
      detail: `Compliance gate rejected by ${currentUser.name}: ${rejectComment}`,
      timestamp: new Date().toISOString(),
    });
    setRejectComment("");
    setRejectDialogOpen(false);
  };

  const handleSaveEvidence = () => {
    if (!evidenceDialogItem) return;
    updateChecklistEvidence(request.id, evidenceDialogItem, evidenceUrl, evidenceNotes);
    setEvidenceDialogItem(null);
    setEvidenceUrl("");
    setEvidenceNotes("");
  };

  const openEvidenceDialog = (itemId: string) => {
    const item = compliance.checklist.find((c) => c.id === itemId);
    setEvidenceDialogItem(itemId);
    setEvidenceUrl(item?.evidenceUrl || "");
    setEvidenceNotes(item?.notes || "");
  };

  const progressPercent = totalChecklist > 0 ? Math.round((checkedCount / totalChecklist) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">Template</p>
          <Select
            value={compliance.templateId}
            onValueChange={handleTemplateChange}
            disabled={compliance.gateStatus === "approved" || compliance.gateStatus === "pending"}
          >
            <SelectTrigger className="h-7 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPLIANCE_TEMPLATES.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.id}>{tpl.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">Risk Level</p>
          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${RISK_COLORS[compliance.riskLevel]}`}>
            {compliance.riskLevel}
          </span>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">Progress</p>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold tabular-nums leading-none">{checkedCount}<span className="text-[11px] font-normal text-muted-foreground">/{totalChecklist}</span></span>
            <span className="text-[11px] text-muted-foreground">({progressPercent}%)</span>
          </div>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">Gate Status</p>
          <Badge variant={gateBadge.variant} className={gateBadge.className || ""}>
            {gateBadge.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Checklist panel */}
        <div className="col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Compliance Checklist</CardTitle>
                <span className="text-xs text-muted-foreground">{checkedCount} of {totalChecklist} completed</span>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section}>
                      <h3 className="mb-2 text-sm font-semibold">{section}</h3>
                      <div className="space-y-2">
                        {compliance.checklist
                          .filter((c) => c.section === section)
                          .map((item) => (
                            <div
                              key={item.id}
                              className={`rounded-md border p-3 transition-colors hover:bg-muted ${
                                item.checked ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20" : ""
                              }`}
                            >
                              <label className="flex items-start gap-3 cursor-pointer">
                                <Checkbox
                                  checked={item.checked}
                                  onCheckedChange={(checked) =>
                                    updateChecklist(request.id, item.id, !!checked)
                                  }
                                  disabled={compliance.gateStatus === "approved"}
                                />
                                <div className="flex-1">
                                  <span className="text-sm">{item.label}</span>
                                  {item.notes && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">{item.notes}</p>
                                  )}
                                  {item.evidenceUrl && (
                                    <p className="mt-0.5 text-xs text-blue-600">
                                      <Link2 className="mr-1 inline h-3 w-3" />
                                      {item.evidenceUrl}
                                    </p>
                                  )}
                                </div>
                              </label>
                              <div className="mt-1 ml-7">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => openEvidenceDialog(item.id)}
                                  disabled={compliance.gateStatus === "approved"}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  {item.evidenceUrl ? "Edit Evidence" : "Add Evidence"}
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Gate panel */}
        <div className="col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {compliance.gateStatus === "approved" ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                )}
                Compliance Gate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant={gateBadge.variant} className={`text-sm ${gateBadge.className || ""}`}>
                  {gateBadge.label}
                </Badge>
              </div>

              {compliance.approvals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Approvals</p>
                  {compliance.approvals.map((apr) => (
                    <div key={apr.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{apr.userName}</span>
                        <Badge
                          variant={apr.action === "approve" ? "default" : "destructive"}
                          className={apr.action === "approve" ? "bg-green-600 hover:bg-green-600 text-white" : ""}
                        >
                          {apr.action === "approve" ? "Approved" : "Changes Requested"}
                        </Badge>
                      </div>
                      {apr.comment && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <MessageSquare className="mr-1 inline h-3 w-3" />
                          {apr.comment}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(apr.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {(canSubmitGate || canResubmit) && (
                  <Button className="w-full" onClick={handleSubmit}>
                    {canResubmit ? "Resubmit for Review" : "Submit for Compliance Review"}
                  </Button>
                )}
                {canApprove && (
                  <>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                      <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Request Changes
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request Changes</DialogTitle>
                        </DialogHeader>
                        <Textarea
                          placeholder="Explain what needs to be changed (required)"
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                        />
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={!rejectComment.trim()}
                          >
                            Submit Rejection
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!evidenceDialogItem} onOpenChange={(open) => { if (!open) setEvidenceDialogItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Evidence URL</Label>
              <Input
                placeholder="https://docs.example.com/..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={handleSaveEvidence}>Save Evidence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
