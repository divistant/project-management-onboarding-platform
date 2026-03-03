"use client";

import { useState } from "react";
import type { OnboardingRequest, User, ArtifactType } from "@/types/onboarding";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { USERS } from "@/mocks/seed-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  ShieldX,
  UserPlus,
} from "lucide-react";

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  wiki: "Wiki Draft",
  backlog: "Backlog Draft",
  compliance: "Compliance",
};

export function ReviewApprovalsView({
  request,
  currentUser,
}: {
  request: OnboardingRequest;
  currentUser: User;
}) {
  const { comments, addComment, addAuditEvent, setArtifactApproval, assignReviewer } =
    useOnboardingStore();
  const [newComment, setNewComment] = useState("");
  const [activeArtifact, setActiveArtifact] = useState<ArtifactType>("wiki");

  const requestComments = comments.filter((c) => c.onboardingId === request.id);
  const filteredComments = requestComments.filter((c) => c.artifact === activeArtifact);
  const reviewers = request.reviewers || [];
  const artifactApprovals = request.artifactApprovals || [];

  const reviewableUsers = USERS.filter(
    (u) => u.role === "compliance" || u.role === "tech_lead"
  );

  const canReview =
    currentUser.role === "compliance" || currentUser.role === "tech_lead" || currentUser.role === "admin";

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment({
      id: `cmt-${Date.now()}`,
      onboardingId: request.id,
      artifact: activeArtifact,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
      timestamp: new Date().toISOString(),
    });
    addAuditEvent({
      id: `aud-cmt-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "comment",
      detail: `Added comment on ${activeArtifact}: "${newComment.slice(0, 50)}..."`,
      timestamp: new Date().toISOString(),
    });
    setNewComment("");
  };

  const handleAssignReviewer = (artifact: ArtifactType, userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    if (!user) return;
    assignReviewer(request.id, artifact, user.id, user.name);
    addAuditEvent({
      id: `aud-assign-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "assign",
      detail: `Assigned ${user.name} as reviewer for ${artifact}`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleApproveArtifact = (artifact: ArtifactType) => {
    setArtifactApproval(request.id, {
      artifact,
      status: "approved",
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      comment: "Approved",
      timestamp: new Date().toISOString(),
    });
    addAuditEvent({
      id: `aud-art-approve-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "approve",
      detail: `Approved ${artifact} artifact`,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRequestChanges = (artifact: ArtifactType) => {
    setArtifactApproval(request.id, {
      artifact,
      status: "changes_requested",
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      comment: "Changes needed",
      timestamp: new Date().toISOString(),
    });
    addAuditEvent({
      id: `aud-art-reject-${Date.now()}`,
      onboardingId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      action: "reject",
      detail: `Requested changes on ${artifact} artifact`,
      timestamp: new Date().toISOString(),
    });
  };

  const getApprovalBadge = (artifact: ArtifactType) => {
    const approval = artifactApprovals.find((a) => a.artifact === artifact);
    if (!approval) return <Badge variant="secondary">Pending Review</Badge>;
    if (approval.status === "approved") return <Badge variant="default">Approved</Badge>;
    return <Badge variant="destructive">Changes Requested</Badge>;
  };

  const getReviewerFor = (artifact: ArtifactType) =>
    reviewers.find((r) => r.artifact === artifact);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["wiki", "backlog", "compliance"] as ArtifactType[]).map((artifact) => {
              const reviewer = getReviewerFor(artifact);
              return (
                <div key={artifact} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{ARTIFACT_LABELS[artifact]}</p>
                    {getApprovalBadge(artifact)}
                  </div>
                  <p className="text-sm font-medium">
                    {artifact === "wiki" && request.wikiDraft
                      ? `${request.wikiDraft.outline.length} sections`
                      : artifact === "backlog" && request.backlogDraft
                        ? `${countItems(request.backlogDraft.items)} items`
                        : artifact === "compliance"
                          ? formatGateStatus(request.compliance?.gateStatus)
                          : "Not available"}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <UserPlus className="h-3 w-3 text-muted-foreground" />
                    {reviewer ? (
                      <span>{reviewer.userName}</span>
                    ) : (currentUser.role === "pm" || currentUser.role === "admin") ? (
                      <Select onValueChange={(v) => handleAssignReviewer(artifact, v)}>
                        <SelectTrigger className="h-6 w-[140px] text-xs">
                          <SelectValue placeholder="Assign reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {reviewableUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Comments & Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeArtifact}
            onValueChange={(v) => setActiveArtifact(v as ArtifactType)}
          >
            <TabsList>
              {(["wiki", "backlog", "compliance"] as ArtifactType[]).map((a) => (
                <TabsTrigger key={a} value={a}>
                  {ARTIFACT_LABELS[a]} ({requestComments.filter((c) => c.artifact === a).length})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeArtifact}>
              {canReview && (
                <div className="mb-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveArtifact(activeArtifact)}
                  >
                    <ShieldCheck className="mr-1 h-4 w-4" /> Approve {ARTIFACT_LABELS[activeArtifact]}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRequestChanges(activeArtifact)}
                  >
                    <ShieldX className="mr-1 h-4 w-4" /> Request Changes
                  </Button>
                </div>
              )}

              <ScrollArea className="h-[300px]">
                {filteredComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MessageSquare className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No comments yet for {ARTIFACT_LABELS[activeArtifact]}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 rounded-md border p-3">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {comment.userName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="mt-4 flex gap-2">
                <Textarea
                  placeholder={`Add a comment about ${ARTIFACT_LABELS[activeArtifact]}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button
                  size="sm"
                  className="shrink-0 self-end"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

const GATE_STATUS_LABELS: Record<string, string> = {
  not_submitted: "Not yet submitted",
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

function formatGateStatus(status?: string): string {
  if (!status) return "Not available";
  return GATE_STATUS_LABELS[status] || status;
}

function countItems(items: { children?: unknown[] }[]): number {
  let count = 0;
  const walk = (list: { children?: unknown[] }[]) => {
    for (const item of list) {
      count++;
      if (item.children) walk(item.children as { children?: unknown[] }[]);
    }
  };
  walk(items);
  return count;
}
