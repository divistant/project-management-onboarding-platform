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
import { Check, Plus, Trash2, Webhook, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";

interface WebhookEntry {
    id: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
    lastTriggered: string | null;
    status: "active" | "failing" | "never";
}

const AVAILABLE_EVENTS = [
    "pipeline.started",
    "pipeline.completed",
    "pipeline.failed",
    "approval.requested",
    "approval.completed",
    "project.generated",
    "document.uploaded",
];

const INITIAL_WEBHOOKS: WebhookEntry[] = [
    {
        id: "wh-1",
        name: "Slack Notification",
        url: "https://hooks.slack.com/services/T00/B00/xxxx",
        events: ["pipeline.completed", "pipeline.failed", "approval.requested"],
        enabled: true,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "active",
    },
    {
        id: "wh-2",
        name: "Teams Channel",
        url: "https://outlook.office.com/webhook/xxxx",
        events: ["project.generated"],
        enabled: false,
        lastTriggered: null,
        status: "never",
    },
];

export function WebhooksSettings() {
    const [webhooks, setWebhooks] = useState<WebhookEntry[]>(INITIAL_WEBHOOKS);
    const [saved, setSaved] = useState(false);

    const handleAdd = () => {
        const newWh: WebhookEntry = {
            id: `wh-${Date.now()}`,
            name: "New Webhook",
            url: "",
            events: [],
            enabled: true,
            lastTriggered: null,
            status: "never",
        };
        setWebhooks((w) => [...w, newWh]);
    };

    const handleUpdate = (id: string, updates: Partial<WebhookEntry>) => {
        setWebhooks((w) => w.map((wh) => (wh.id === id ? { ...wh, ...updates } : wh)));
    };

    const handleDelete = (id: string) => {
        setWebhooks((w) => w.filter((wh) => wh.id !== id));
    };

    const toggleEvent = (webhookId: string, event: string) => {
        setWebhooks((w) =>
            w.map((wh) => {
                if (wh.id !== webhookId) return wh;
                const has = wh.events.includes(event);
                return { ...wh, events: has ? wh.events.filter((e) => e !== event) : [...wh.events, event] };
            })
        );
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const StatusIcon = ({ status }: { status: WebhookEntry["status"] }) => {
        if (status === "active") return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
        if (status === "failing") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Webhooks</h2>
                    <p className="text-sm text-muted-foreground">Configure webhook endpoints for event notifications</p>
                </div>
                <Button size="sm" onClick={handleAdd}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Webhook
                </Button>
            </div>

            {webhooks.length === 0 && (
                <Card className="gap-0 py-0">
                    <CardContent className="py-12 text-center">
                        <Webhook className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium">No webhooks configured</p>
                        <p className="text-xs text-muted-foreground mt-1">Add a webhook to receive event notifications</p>
                    </CardContent>
                </Card>
            )}

            {webhooks.map((wh) => (
                <Card key={wh.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <StatusIcon status={wh.status} />
                                <CardTitle className="text-sm">{wh.name}</CardTitle>
                                <Badge variant={wh.enabled ? "default" : "secondary"} className="text-[9px]">
                                    {wh.enabled ? "Active" : "Disabled"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={wh.enabled} onCheckedChange={(checked) => handleUpdate(wh.id, { enabled: checked })} />
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(wh.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Name</Label>
                                <Input value={wh.name} onChange={(e) => handleUpdate(wh.id, { name: e.target.value })} className="h-8 text-sm" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Payload URL</Label>
                            <div className="flex gap-2">
                                <Input value={wh.url} onChange={(e) => handleUpdate(wh.id, { url: e.target.value })} placeholder="https://example.com/webhook" className="h-8 font-mono text-xs" />
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => navigator.clipboard.writeText(wh.url)}>
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Events</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {AVAILABLE_EVENTS.map((event) => {
                                    const isSelected = wh.events.includes(event);
                                    return (
                                        <button
                                            key={event}
                                            onClick={() => toggleEvent(wh.id, event)}
                                            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground hover:bg-muted/50"
                                                }`}
                                        >
                                            {event}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {wh.lastTriggered && (
                            <p className="text-[11px] text-muted-foreground">
                                Last triggered: {new Date(wh.lastTriggered).toLocaleString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Webhooks saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Webhooks</Button>
                )}
            </div>
        </div>
    );
}
