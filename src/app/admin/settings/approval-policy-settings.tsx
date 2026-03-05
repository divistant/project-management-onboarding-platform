"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, UserCheck, FileCheck } from "lucide-react";

interface ApprovalRule {
    artifact: string;
    label: string;
    minApprovers: number;
    requiredRoles: string[];
    autoApprove: boolean;
}

const INITIAL_RULES: ApprovalRule[] = [
    {
        artifact: "wiki",
        label: "Wiki Draft",
        minApprovers: 1,
        requiredRoles: ["pm", "tech_lead"],
        autoApprove: false,
    },
    {
        artifact: "backlog",
        label: "Backlog Draft",
        minApprovers: 2,
        requiredRoles: ["pm", "tech_lead"],
        autoApprove: false,
    },
    {
        artifact: "compliance",
        label: "Compliance Gate",
        minApprovers: 1,
        requiredRoles: ["compliance", "admin"],
        autoApprove: false,
    },
];

const AVAILABLE_ROLES = [
    { id: "pm", label: "Project Manager" },
    { id: "compliance", label: "Compliance Officer" },
    { id: "tech_lead", label: "Tech Lead" },
    { id: "admin", label: "Admin" },
];

export function ApprovalPolicySettings() {
    const [rules, setRules] = useState<ApprovalRule[]>(INITIAL_RULES);
    const [requireAllApprovals, setRequireAllApprovals] = useState(true);
    const [saved, setSaved] = useState(false);

    const updateRule = (artifact: string, updates: Partial<ApprovalRule>) => {
        setRules((r) => r.map((rule) => rule.artifact === artifact ? { ...rule, ...updates } : rule));
    };

    const toggleRole = (artifact: string, roleId: string) => {
        setRules((r) =>
            r.map((rule) => {
                if (rule.artifact !== artifact) return rule;
                const has = rule.requiredRoles.includes(roleId);
                return {
                    ...rule,
                    requiredRoles: has
                        ? rule.requiredRoles.filter((r) => r !== roleId)
                        : [...rule.requiredRoles, roleId],
                };
            })
        );
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Approval Policy</h2>
                <p className="text-sm text-muted-foreground">Configure approval requirements for each artifact type</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="h-4 w-4" /> General Policy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-medium">Require all artifact approvals</p>
                            <p className="text-xs text-muted-foreground">All artifacts must be approved before generation</p>
                        </div>
                        <Switch checked={requireAllApprovals} onCheckedChange={setRequireAllApprovals} />
                    </div>
                </CardContent>
            </Card>

            {rules.map((rule) => (
                <Card key={rule.artifact}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    {rule.label}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Configure who can approve the {rule.label.toLowerCase()}
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                                {rule.requiredRoles.length} role{rule.requiredRoles.length !== 1 ? "s" : ""}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Minimum Approvers</Label>
                            <Select
                                value={String(rule.minApprovers)}
                                onValueChange={(v) => updateRule(rule.artifact, { minApprovers: parseInt(v) })}
                            >
                                <SelectTrigger className="h-9 w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Required Roles</Label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_ROLES.map((role) => {
                                    const isSelected = rule.requiredRoles.includes(role.id);
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => toggleRole(rule.artifact, role.id)}
                                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${isSelected
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-muted text-muted-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            {role.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">Auto-approve</p>
                                <p className="text-xs text-muted-foreground">Skip approval if quality score &gt; 90%</p>
                            </div>
                            <Switch
                                checked={rule.autoApprove}
                                onCheckedChange={(checked) => updateRule(rule.artifact, { autoApprove: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Policy saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Policy</Button>
                )}
            </div>
        </div>
    );
}
