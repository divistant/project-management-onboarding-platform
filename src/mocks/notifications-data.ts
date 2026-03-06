export type NotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    type: NotificationType;
    link?: string;
}

export const mockNotifications: AppNotification[] = [
    {
        id: "notif-1",
        title: "New Project Initiated",
        description: "Retail Banking Expansion project has been created by Sarah Connor.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        read: false,
        type: "info",
        link: "/workspace/onb-1"
    },
    {
        id: "notif-2",
        title: "AI Enrichment Successful",
        description: "Compliance documents for 'Cloud Migration' passed automated checks.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        type: "success",
    },
    {
        id: "notif-3",
        title: "Action Required",
        description: "Data mapping review is pending for the APAC Onboarding workflow.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        type: "warning",
        link: "/onboarding"
    },
    {
        id: "notif-4",
        title: "Integration Error",
        description: "Jira sync failed for project 'Core Banking Upgrade'. Please check credentials.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: true,
        type: "error",
        link: "/admin/integrations"
    },
    {
        id: "notif-5",
        title: "System Maintenance",
        description: "Scheduled downtime on Saturday at 02:00 AM UTC for v1.1 update.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        read: true,
        type: "info"
    }
];
