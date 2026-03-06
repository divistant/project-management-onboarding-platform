"use client";

import { useNotificationsStore } from "@/stores/notifications-store";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/mocks/notifications-data";

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

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsStore();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px] p-0" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <DropdownMenuLabel className="p-0 font-semibold text-sm">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto text-xs text-muted-foreground hover:text-foreground p-0"
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                        >
                            <Check className="mr-1 h-3 w-3" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                                <Bell className="h-6 w-6 opacity-40" />
                            </div>
                            <p>You&apos;re all caught up!</p>
                            <p className="text-xs mt-1">Check back later for new alerts.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => {
                                const isUnread = !notification.read;

                                return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted border-b last:border-0 rounded-none",
                                            isUnread ? "bg-muted/30" : ""
                                        )}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        asChild
                                    >
                                        {notification.link ? (
                                            <Link href={notification.link}>
                                                <div className="flex w-full gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <TypeIcon type={notification.type} className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <div className="flex items-start justify-between gap-2 w-full">
                                                            <span className={cn("text-sm font-medium leading-none", isUnread ? "text-foreground" : "text-foreground/80")}>
                                                                {notification.title}
                                                            </span>
                                                            {isUnread && (
                                                                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-0.5" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                                            {notification.description}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider font-medium">
                                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex w-full gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <TypeIcon type={notification.type} className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col gap-1 w-full">
                                                    <div className="flex items-start justify-between gap-2 w-full">
                                                        <span className={cn("text-sm font-medium leading-none", isUnread ? "text-foreground" : "text-foreground/80")}>
                                                            {notification.title}
                                                        </span>
                                                        {isUnread && (
                                                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-0.5" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground leading-snug line-clamp-2">
                                                        {notification.description}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider font-medium">
                                                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="m-0" />
                        <div className="p-1">
                            <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground" asChild>
                                <Link href="/dashboard/notifications">
                                    View all notifications
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
