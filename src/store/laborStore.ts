// store/laborStore.ts
import { Labor } from "@/types/labor";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface LaborStore {
    labors: Labor[];
    setLabors: (labors: Labor[]) => void;
    addLabor: (labor: Labor) => void;
    updateLabor: (updatedLabor: Labor) => void;
    deleteLabor: (laborId: string) => void;
}

export const useLaborStore = create<LaborStore>()(
    persist(
        (set) => ({
            labors: [],
            setLabors: (labors) => set({ labors }),
            addLabor: (labor) =>
                set((state) => ({ labors: [...state.labors, labor] })),
            updateLabor: (updatedLabor) =>
                set((state) => ({
                    labors: state.labors.map((labor) =>
                        labor.id === updatedLabor.id ? updatedLabor : labor
                    ),
                })),
            deleteLabor: (laborId) =>
                set((state) => ({
                    labors: state.labors.filter(
                        (labor) => labor.id !== laborId
                    ),
                })),
        }),
        {
            name: "labor-store",
            storage: {
                getItem: (name: string): StorageValue<LaborStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<LaborStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<LaborStore>,
        }
    )
);
