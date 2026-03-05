"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";

interface NotifChannel {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
}

interface NotifEvent {
    id: string;
    label: string;
    description: string;
    email: boolean;
    inApp: boolean;
    slack: boolean;
}

const INITIAL_EVENTS: NotifEvent[] = [
    { id: "pipeline_start", label: "Pipeline Started", description: "When a document processing pipeline begins", email: false, inApp: true, slack: false },
    { id: "pipeline_done", label: "Pipeline Completed", description: "When all pipeline steps finish successfully", email: true, inApp: true, slack: true },
    { id: "pipeline_fail", label: "Pipeline Failed", description: "When a pipeline step encounters an error", email: true, inApp: true, slack: true },
    { id: "approval_req", label: "Approval Requested", description: "When an artifact needs your review and approval", email: true, inApp: true, slack: true },
    { id: "approval_done", label: "Approval Completed", description: "When an artifact is approved or changes requested", email: true, inApp: true, slack: false },
    { id: "project_gen", label: "Project Generated", description: "When a project is generated in GitLab/Jira", email: true, inApp: true, slack: true },
    { id: "doc_upload", label: "Document Uploaded", description: "When a new document is uploaded to a project", email: false, inApp: true, slack: false },
    { id: "compliance_gate", label: "Compliance Gate Update", description: "When compliance gate status changes", email: true, inApp: true, slack: false },
];

export function NotificationsSettings() {
    const [events, setEvents] = useState<NotifEvent[]>(INITIAL_EVENTS);
    const [digestFrequency, setDigestFrequency] = useState("realtime");
    const [saved, setSaved] = useState(false);

    const toggleChannel = (eventId: string, channel: "email" | "inApp" | "slack") => {
        setEvents((evts) =>
            evts.map((e) => (e.id === eventId ? { ...e, [channel]: !e[channel] } : e))
        );
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Configure how and when you receive notifications</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Delivery Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium">Email Digest Frequency</label>
                        <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                            <SelectTrigger className="h-9 w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="realtime">Real-time</SelectItem>
                                <SelectItem value="hourly">Hourly digest</SelectItem>
                                <SelectItem value="daily">Daily digest</SelectItem>
                                <SelectItem value="weekly">Weekly digest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Event Notifications</CardTitle>
                    <CardDescription className="text-xs">Choose which channels receive each notification type</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 mb-3 px-1">
                        <div />
                        <div className="flex flex-col items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Email</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">In-App</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Slack</span>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="space-y-1">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center rounded-md px-3 py-2.5 hover:bg-muted/30 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium">{event.label}</p>
                                    <p className="text-[11px] text-muted-foreground">{event.description}</p>
                                </div>
                                <div className="flex justify-center">
                                    <Switch
                                        checked={event.email}
                                        onCheckedChange={() => toggleChannel(event.id, "email")}
                                        className="scale-75"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <Switch
                                        checked={event.inApp}
                                        onCheckedChange={() => toggleChannel(event.id, "inApp")}
                                        className="scale-75"
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <Switch
                                        checked={event.slack}
                                        onCheckedChange={() => toggleChannel(event.id, "slack")}
                                        className="scale-75"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <Check className="h-4 w-4" /> Preferences saved
                    </span>
                ) : (
                    <Button size="sm" onClick={handleSave}>Save Preferences</Button>
                )}
            </div>
        </div>
    );
}
