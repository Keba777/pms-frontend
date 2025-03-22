// store/activityStore.ts
import { Activity } from "@/types/activity";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface ActivityStore {
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (updatedActivity: Activity) => void;
  deleteActivity: (activityId: string) => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      activities: [],
      setActivities: (activities) => set({ activities }),
      addActivity: (activity) =>
        set((state) => ({ activities: [...state.activities, activity] })),
      updateActivity: (updatedActivity) =>
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === updatedActivity.id ? updatedActivity : activity
          ),
        })),
      deleteActivity: (activityId) =>
        set((state) => ({
          activities: state.activities.filter(
            (activity) => activity.id !== activityId
          ),
        })),
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
