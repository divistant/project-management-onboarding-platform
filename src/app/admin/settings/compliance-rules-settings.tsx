"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Check, Shield, Plus, Trash2, GripVertical } from "lucide-react";

interface ChecklistRule {
    id: string;
    section: string;
    label: string;
    required: boolean;
}

const INITIAL_RULES: ChecklistRule[] = [
    { id: "r1", section: "Documentation", label: "BRD document uploaded and reviewed", required: true },
    { id: "r2", section: "Documentation", label: "PRD document uploaded and reviewed", required: false },
    { id: "r3", section: "Documentation", label: "Technical architecture documented", required: false },
    { id: "r4", section: "Security", label: "Security threat model documented", required: true },
    { id: "r5", section: "Security", label: "Data encryption requirements defined", required: false },
    { id: "r6", section: "Security", label: "Authentication design reviewed", required: true },
    { id: "r7", section: "Data Handling", label: "PII data handling procedures defined", required: true },
    { id: "r8", section: "Data Handling", label: "Data retention policy documented", required: false },
    { id: "r9", section: "Approval", label: "Architecture review completed", required: true },
    { id: "r10", section: "Approval", label: "Stakeholder sign-off obtained", required: true },
];

const SECTIONS = ["Documentation", "Security", "Data Handling", "Approval"];

export function ComplianceRulesSettings() {
    const [rules, setRules] = useState<ChecklistRule[]>(INITIAL_RULES);
    const [defaultRiskLevel, setDefaultRiskLevel] = useState("Medium");
    const [autoAssign, setAutoAssign] = useState(true);
    const [saved, setSaved] = useState(false);

    const handleToggleRequired = (id: string) => {
        setRules((r) => r.map((rule) => rule.id === id ? { ...rule, required: !rule.required } : rule));
    };

    const handleDeleteRule = (id: string) => {
        setRules((r) => r.filter((rule) => rule.id !== id));
    };

    const handleAddRule = (section: string) => {
        const newRule: ChecklistRule = {
            id: `r-${Date.now()}`,
            section,
            label: "New checklist item",
            required: false,
        };
        setRules((r) => [...r, newRule]);
    };

    const handleUpdateLabel = (id: string, label: string) => {
        setRules((r) => r.map((rule) => rule.id === id ? { ...rule, label } : rule));
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Compliance Rules</h2>
                <p className="text-sm text-muted-foreground">Manage compliance checklist items and risk level defaults</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" /> General
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Default Risk Level</Label>
                        <Select value={defaultRiskLevel} onValueChange={setDefaultRiskLevel}>
                            <SelectTrigger className="h-9 w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-medium">Auto-assign checklist</p>
                            <p className="text-xs text-muted-foreground">Automatically assign compliance checklist to new projects</p>
                        </div>
                        <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
                    </div>
                </CardContent>
            </Card>

            {SECTIONS.map((section) => {
                const sectionRules = rules.filter((r) => r.section === section);
                return (
                    <Card key={section}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">{section}</CardTitle>
                                <Badge variant="outline" className="text-[10px]">{sectionRules.length} items</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {sectionRules.map((rule) => (
                                <div key={rule.id} className="flex items-center gap-2 rounded-md border p-2.5">
                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab shrink-0" />
                                    <Input
                                        value={rule.label}
                                        onChange={(e) => handleUpdateLabel(rule.id, e.target.value)}
                                        className="h-7 text-xs border-0 shadow-none p-0 focus-visible:ring-0"
                                    />
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge
                                            variant={rule.required ? "default" : "outline"}
                                            className="text-[9px] cursor-pointer"
                                            onClick={() => handleToggleRequired(rule.id)}
                                        >
                                            {rule.required ? "Required" : "Optional"}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteRule(rule.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-muted-foreground border border-dashed"
                                onClick={() => handleAddRule(section)}
                            >
                                <Plus className="mr-1 h-3 w-3" /> Add item
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Rules saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Rules</Button>
                )}
            </div>
        </div>
    );
}
