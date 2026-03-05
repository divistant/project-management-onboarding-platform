"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { cn } from "@/lib/utils";
import {
    User,
    Monitor,
    Bot,
    MessageSquareText,
    ScanText,
    Plug,
    Webhook,
    Bell,
    KeyRound,
    Shield,
    UserCheck,
    Cog,
} from "lucide-react";

import { ProfileSettings } from "./profile-settings";
import { SessionsSettings } from "./sessions-settings";
import { LlmModelSettings } from "./llm-model-settings";
import { PromptsSettings } from "./prompts-settings";
import { OcrSettings } from "./ocr-settings";
import { IntegrationsSettings } from "./integrations-settings";
import { WebhooksSettings } from "./webhooks-settings";
import { NotificationsSettings } from "./notifications-settings";
import { ApiKeysSettings } from "./api-keys-settings";
import { ComplianceRulesSettings } from "./compliance-rules-settings";
import { ApprovalPolicySettings } from "./approval-policy-settings";
import { SystemConfigSettings } from "./system-config-settings";

interface SettingsNavGroup {
    label: string;
    items: {
        id: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}

const SETTINGS_NAV: SettingsNavGroup[] = [
    {
        label: "ACCOUNT",
        items: [
            { id: "profile", label: "Profile", icon: User },
            { id: "sessions", label: "Sessions", icon: Monitor },
        ],
    },
    {
        label: "AI & PROCESSING",
        items: [
            { id: "llm-model", label: "LLM Model", icon: Bot },
            { id: "prompts", label: "Prompts", icon: MessageSquareText },
            { id: "ocr", label: "OCR Settings", icon: ScanText },
        ],
    },
    {
        label: "INTEGRATIONS",
        items: [
            { id: "pm-tools", label: "PM Tools", icon: Plug },
            { id: "webhooks", label: "Webhooks", icon: Webhook },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "api-keys", label: "API Keys", icon: KeyRound },
        ],
    },
    {
        label: "GOVERNANCE",
        items: [
            { id: "compliance-rules", label: "Compliance Rules", icon: Shield },
            { id: "approval-policy", label: "Approval Policy", icon: UserCheck },
        ],
    },
    {
        label: "SYSTEM",
        items: [
            { id: "system-config", label: "System Config", icon: Cog },
        ],
    },
];

const CONTENT_MAP: Record<string, React.ComponentType> = {
    "profile": ProfileSettings,
    "sessions": SessionsSettings,
    "llm-model": LlmModelSettings,
    "prompts": PromptsSettings,
    "ocr": OcrSettings,
    "pm-tools": IntegrationsSettings,
    "webhooks": WebhooksSettings,
    "notifications": NotificationsSettings,
    "api-keys": ApiKeysSettings,
    "compliance-rules": ComplianceRulesSettings,
    "approval-policy": ApprovalPolicySettings,
    "system-config": SystemConfigSettings,
};

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState("profile");

    const ContentComponent = CONTENT_MAP[activeSection];

    return (
        <AppLayout>
            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Manage your account, integrations, and preferences
                    </p>
                </div>

                <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
                    {/* Left sidebar nav */}
                    <nav className="sticky top-4 space-y-4">
                        {SETTINGS_NAV.map((group) => (
                            <div key={group.label}>
                                <p className="mb-1 px-2 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
                                    {group.label}
                                </p>
                                <div className="space-y-0.5">
                                    {group.items.map((item) => {
                                        const isActive = activeSection === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveSection(item.id)}
                                                className={cn(
                                                    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-muted text-foreground"
                                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                                )}
                                            >
                                                <item.icon className="h-4 w-4 shrink-0" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Right content panel */}
                    <div className="min-w-0">
                        {ContentComponent && <ContentComponent />}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
