import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { Notification } from "@/types/notification";

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    setNotifications: (notes: Notification[]) => void;
    addNotification: (note: Notification) => void;
    updateNotification: (note: Notification) => void;
    deleteNotification: (id: string) => void;
    markRead: (id: string) => void;
    markAllRead: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            setNotifications: (notes) => {
                set({ notifications: notes });
                set({ unreadCount: notes.filter(n => !n.read).length });
            },

            addNotification: (note) =>
                set((state) => {
                    const newList = [note, ...state.notifications];
                    return {
                        notifications: newList,
                        unreadCount: state.unreadCount + (note.read ? 0 : 1),
                    };
                }),

            updateNotification: (updated) =>
                set((state) => {
                    const newList = state.notifications.map(n =>
                        n.id === updated.id ? updated : n
                    );
                    return {
                        notifications: newList,
                        unreadCount: newList.filter(n => !n.read).length,
                    };
                }),

            deleteNotification: (id) =>
                set((state) => {
                    const newList = state.notifications.filter(n => n.id !== id);
                    return {
                        notifications: newList,
                        unreadCount: newList.filter(n => !n.read).length,
                    };
                }),

            markRead: (id) =>
                set((state) => {
                    const newList = state.notifications.map(n =>
                        n.id === id ? { ...n, read: true } : n
                    );
                    return {
                        notifications: newList,
                        unreadCount: newList.filter(n => !n.read).length,
                    };
                }),

            markAllRead: () =>
                set((state) => {
                    const newList = state.notifications.map(n => ({ ...n, read: true }));
                    return { notifications: newList, unreadCount: 0 };
                }),

            setUnreadCount: (count) => set({ unreadCount: count }),
        }),
        {
            name: "notification-store",
            storage: {
                getItem: (name: string): StorageValue<NotificationState> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<NotificationState>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<NotificationState>,
        }
    )
);
