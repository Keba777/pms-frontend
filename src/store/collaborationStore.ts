import {
  AppActivity,
  AppDiscussion,
  AppNotification,
} from "@/types/collaboration";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface DiscussionStore {
  discussions: AppDiscussion[];
  setDiscussions: (d: AppDiscussion[]) => void;
  addDiscussion: (d: AppDiscussion) => void;
  updateDiscussion: (d: AppDiscussion) => void;
  deleteDiscussion: (id: number | string) => void;
}

export const useDiscussionStore = create<DiscussionStore>()(
  persist(
    (set) => ({
      discussions: [],
      setDiscussions: (d) => set({ discussions: d }),
      addDiscussion: (d) =>
        set((s) => ({ discussions: [...s.discussions, d] })),
      updateDiscussion: (d) =>
        set((s) => ({
          discussions: s.discussions.map((it) => (it.id === d.id ? d : it)),
        })),
      deleteDiscussion: (id) =>
        set((s) => ({
          discussions: s.discussions.filter((it) => it.id !== id),
        })),
    }),
    {
      name: "discussion-store",
      storage: {
        getItem: (name: string): StorageValue<DiscussionStore> | null => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name: string, value: StorageValue<DiscussionStore>): void => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string): void => {
          localStorage.removeItem(name);
        },
      } as PersistStorage<DiscussionStore>,
    }
  )
);

/* =======================
   Store (Zustand) for Notifications
   ======================= */

interface NotificationStore {
  notifications: AppNotification[];
  setNotifications: (n: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  updateNotification: (n: AppNotification) => void;
  deleteNotification: (id: number | string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      setNotifications: (n) => set({ notifications: n }),
      addNotification: (n) =>
        set((s) => ({ notifications: [...s.notifications, n] })),
      updateNotification: (n) =>
        set((s) => ({
          notifications: s.notifications.map((it) => (it.id === n.id ? n : it)),
        })),
      deleteNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((it) => it.id !== id),
        })),
    }),
    {
      name: "notification-store",
      storage: {
        getItem: (name: string): StorageValue<NotificationStore> | null => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (
          name: string,
          value: StorageValue<NotificationStore>
        ): void => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string): void => {
          localStorage.removeItem(name);
        },
      } as PersistStorage<NotificationStore>,
    }
  )
);

/* =======================
   Store (Zustand) for Activities
   ======================= */

interface ActivityStore {
  activities: AppActivity[];
  setActivities: (a: AppActivity[]) => void;
  addActivity: (a: AppActivity) => void;
  updateActivity: (a: AppActivity) => void;
  deleteActivity: (id: number | string) => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      activities: [],
      setActivities: (a) => set({ activities: a }),
      addActivity: (a) => set((s) => ({ activities: [...s.activities, a] })),
      updateActivity: (a) =>
        set((s) => ({
          activities: s.activities.map((it) => (it.id === a.id ? a : it)),
        })),
      deleteActivity: (id) =>
        set((s) => ({ activities: s.activities.filter((it) => it.id !== id) })),
    }),
    {
      name: "activity-store",
      storage: {
        getItem: (name: string): StorageValue<ActivityStore> | null => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name: string, value: StorageValue<ActivityStore>): void => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string): void => {
          localStorage.removeItem(name);
        },
      } as PersistStorage<ActivityStore>,
    }
  )
);
