"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    LayoutDashboard,
    FolderKanban,
    BookOpen,
    Settings,
    Users,
    ScrollText,
    Search,
    Bot,
    MessageSquareText,
    ScanText,
    Plug,
    Shield,
    KeyRound,
    UserCheck,
    Cog,
    Bell,
    Webhook,
} from "lucide-react";

interface CommandItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    action?: () => void;
    group: string;
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const requests = useOnboardingStore((s) => s.requests);

    // ⌘K shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const navigate = useCallback(
        (href: string) => {
            setOpen(false);
            router.push(href);
        },
        [router]
    );

    const NAVIGATION_ITEMS: CommandItem[] = [
        { label: "Go to Dashboard", icon: LayoutDashboard, href: "/dashboard", group: "Navigation" },
        { label: "Go to Onboarding Projects", icon: FolderKanban, href: "/onboarding", group: "Navigation" },
        { label: "Go to New Onboarding", icon: FolderKanban, href: "/onboarding/new", group: "Navigation" },
        { label: "Go to Templates & Standards", icon: BookOpen, href: "/admin/templates", group: "Navigation" },
        { label: "Go to Settings", icon: Settings, href: "/admin/settings", group: "Navigation" },
        { label: "Go to Users", icon: Users, href: "/admin/users", group: "Navigation" },
        { label: "Go to Audit Log", icon: ScrollText, href: "/audit", group: "Navigation" },
    ];

    const SETTINGS_ITEMS: CommandItem[] = [
        { label: "LLM Model Configuration", icon: Bot, href: "/admin/settings", action: () => navigate("/admin/settings"), group: "Settings" },
        { label: "Prompt Configuration", icon: MessageSquareText, href: "/admin/settings", group: "Settings" },
        { label: "OCR Settings", icon: ScanText, href: "/admin/settings", group: "Settings" },
        { label: "PM Tools & Integrations", icon: Plug, href: "/admin/settings", group: "Settings" },
        { label: "Webhooks", icon: Webhook, href: "/admin/settings", group: "Settings" },
        { label: "Notifications", icon: Bell, href: "/admin/settings", group: "Settings" },
        { label: "API Keys", icon: KeyRound, href: "/admin/settings", group: "Settings" },
        { label: "Compliance Rules", icon: Shield, href: "/admin/settings", group: "Settings" },
        { label: "Approval Policy", icon: UserCheck, href: "/admin/settings", group: "Settings" },
        { label: "System Config", icon: Cog, href: "/admin/settings", group: "Settings" },
    ];

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {/* Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Navigation">
                        {NAVIGATION_ITEMS.map((item) => (
                            <CommandItem
                                key={item.label}
                                onSelect={() => item.href && navigate(item.href)}
                                className="gap-2"
                            >
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Settings">
                        {SETTINGS_ITEMS.map((item) => (
                            <CommandItem
                                key={item.label}
                                onSelect={() => item.href && navigate(item.href)}
                                className="gap-2"
                            >
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    {requests.length > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup heading="Projects">
                                {requests.map((project) => (
                                    <CommandItem
                                        key={project.id}
                                        value={project.name}
                                        onSelect={() => navigate(`/workspace/${project.id}`)}
                                        className="gap-2"
                                    >
                                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span>{project.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{project.org}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
