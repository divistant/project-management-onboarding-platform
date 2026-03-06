import { create } from "zustand";
import { AppNotification, mockNotifications } from "@/mocks/notifications-data";

interface NotificationsState {
    notifications: AppNotification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    addNotification: (notification: Omit<AppNotification, "id" | "read" | "timestamp">) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
    notifications: mockNotifications,
    unreadCount: mockNotifications.filter((n) => !n.read).length,

    markAsRead: (id) =>
        set((state) => {
            const updated = state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            );
            return {
                notifications: updated,
                unreadCount: updated.filter((n) => !n.read).length,
            };
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),

    clearAll: () =>
        set({
            notifications: [],
            unreadCount: 0,
        }),

    addNotification: (notification) =>
        set((state) => {
            const newNotification: AppNotification = {
                ...notification,
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                read: false,
            };
            return {
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            };
        }),
}));
