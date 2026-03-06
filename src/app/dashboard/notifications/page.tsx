"use client";

import { useNotificationsStore } from "@/stores/notifications-store";
import { formatDistanceToNow } from "date-fns";
import { Check, CheckCircle2, AlertCircle, Info, XCircle, Trash2, Bell, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/mocks/notifications-data";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/app-layout";

const TypeIcon = ({ type, className }: { type: NotificationType; className?: string }) => {
    switch (type) {
        case "success":
            return <CheckCircle2 className={cn("text-emerald-500", className)} />;
        case "warning":
            return <AlertCircle className={cn("text-amber-500", className)} />;
        case "error":
            return <XCircle className={cn("text-rose-500", className)} />;
        case "info":
        default:
            return <Info className={cn("text-blue-500", className)} />;
    }
};

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationsStore();

    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-5xl mx-auto h-full w-full">
                <div className="mb-4">
                    <Button variant="ghost" size="sm" asChild className="gap-1 -ml-3 text-muted-foreground hover:text-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 border-b">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}.
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark all as read
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-6 space-y-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-accent/20 rounded-lg border border-dashed">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                <Bell className="h-8 w-8 opacity-40" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">You&apos;re all caught up!</h3>
                            <p className="text-sm mt-1 max-w-sm mx-auto">
                                Check back later for new alerts, messages, and updates related to your projects.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const isUnread = !notification.read;

                            const content = (
                                <Card
                                    className={cn(
                                        "flex flex-col sm:flex-row sm:items-start p-4 sm:p-5 gap-4 transition-colors hover:bg-muted/50 w-full",
                                        isUnread ? "bg-accent/30 border-primary/20" : ""
                                    )}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <TypeIcon type={notification.type} className="h-6 w-6" />
                                    </div>
                                    <div className="flex flex-col flex-1 gap-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("text-base font-semibold", isUnread ? "text-foreground" : "text-foreground/80")}>
                                                    {notification.title}
                                                </span>
                                                {isUnread && (
                                                    <Badge variant="default" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {notification.description}
                                        </p>
                                        <span className="text-xs text-muted-foreground mt-2 block sm:hidden">
                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                </Card>
                            );

                            if (notification.link) {
                                return (
                                    <Link
                                        key={notification.id}
                                        href={notification.link}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        className="block group"
                                    >
                                        {content}
                                    </Link>
                                );
                            }

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    className="cursor-pointer group"
                                >
                                    {content}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
