"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, RotateCcw, MessageSquareText } from "lucide-react";

const PIPELINE_STEPS = [
    {
        id: "extract",
        name: "Extract",
        description: "Convert uploaded documents to structured markdown",
        defaultPrompt: `You are a document extraction assistant. Given a project document (BRD, PRD, FSD), extract and convert its content into well-structured Markdown.

Rules:
- Preserve all headings, tables, and lists
- Convert images to descriptive alt text
- Maintain document hierarchy
- Output clean, readable Markdown`,
    },
    {
        id: "enrichment",
        name: "Enrichment",
        description: "Generate wiki outline and backlog items from extracted content",
        defaultPrompt: `You are a project onboarding assistant. Given extracted document content, generate:

1. A structured wiki outline with sections: Overview, Business Goals, Functional Scope, NFRs, Assumptions, Risks
2. A backlog structure with Epics > Features > Stories > Tasks

Each backlog item must include: title, description, priority, acceptance criteria, and estimate.`,
    },
    {
        id: "quality",
        name: "Quality/Verify",
        description: "Validate completeness and quality of generated artifacts",
        defaultPrompt: `You are a quality assurance assistant. Review the generated wiki and backlog for:

1. Completeness: All source document topics covered
2. Consistency: No contradictions between wiki and backlog
3. Quality: Each story has clear acceptance criteria
4. Coverage: All NFRs mapped to technical tasks

Output a quality score (0-100) and list any issues found.`,
    },
    {
        id: "compliance",
        name: "Mapping/Compliance",
        description: "Map artifacts to compliance requirements",
        defaultPrompt: `You are a compliance mapping assistant. Given the generated artifacts and the compliance checklist template, evaluate each checklist item:

1. Check if evidence exists in the wiki or backlog
2. Auto-fill evidence references where applicable
3. Flag items that need manual review
4. Calculate overall compliance readiness percentage`,
    },
];

export function PromptsSettings() {
    const [prompts, setPrompts] = useState<Record<string, string>>(
        Object.fromEntries(PIPELINE_STEPS.map((s) => [s.id, s.defaultPrompt]))
    );
    const [saved, setSaved] = useState(false);

    const handleReset = (stepId: string) => {
        const step = PIPELINE_STEPS.find((s) => s.id === stepId)!;
        setPrompts((p) => ({ ...p, [stepId]: step.defaultPrompt }));
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Prompts</h2>
                <p className="text-sm text-muted-foreground">Configure system prompts for each pipeline processing step</p>
            </div>

            {PIPELINE_STEPS.map((step) => (
                <Card key={step.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <MessageSquareText className="h-4 w-4" />
                                    {step.name}
                                    <Badge variant="outline" className="text-[9px]">Step</Badge>
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">{step.description}</CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground"
                                onClick={() => handleReset(step.id)}
                            >
                                <RotateCcw className="mr-1 h-3 w-3" /> Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1.5">
                            <Label className="text-xs">System Prompt</Label>
                            <Textarea
                                value={prompts[step.id]}
                                onChange={(e) => setPrompts((p) => ({ ...p, [step.id]: e.target.value }))}
                                className="min-h-[140px] font-mono text-xs leading-relaxed"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">
                                {prompts[step.id].length} characters
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Prompts saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save All Prompts</Button>
                )}
            </div>
        </div>
    );
}
