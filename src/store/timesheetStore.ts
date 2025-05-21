// store/timesheetStore.ts
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import {
    LaborTimesheet,
    EquipmentTimesheet,
    MaterialBalanceSheet,
} from "@/types/timesheet";

interface TimesheetStore {
    // state slices
    laborEntries: LaborTimesheet[];
    equipmentEntries: EquipmentTimesheet[];
    materialEntries: MaterialBalanceSheet[];

    // labor actions
    setLaborEntries: (entries: LaborTimesheet[]) => void;
    addLaborEntry: (entry: LaborTimesheet) => void;
    updateLaborEntry: (entry: LaborTimesheet) => void;
    deleteLaborEntry: (id: string) => void;

    // equipment actions
    setEquipmentEntries: (entries: EquipmentTimesheet[]) => void;
    addEquipmentEntry: (entry: EquipmentTimesheet) => void;
    updateEquipmentEntry: (entry: EquipmentTimesheet) => void;
    deleteEquipmentEntry: (id: string) => void;

    // material actions
    setMaterialEntries: (entries: MaterialBalanceSheet[]) => void;
    addMaterialEntry: (entry: MaterialBalanceSheet) => void;
    updateMaterialEntry: (entry: MaterialBalanceSheet) => void;
    deleteMaterialEntry: (id: string) => void;
}

export const useTimesheetStore = create<TimesheetStore>()(
    persist(
        (set) => ({
            // initial state
            laborEntries: [],
            equipmentEntries: [],
            materialEntries: [],

            // labor
            setLaborEntries: (entries) => set({ laborEntries: entries }),
            addLaborEntry: (entry) =>
                set((state) => ({ laborEntries: [...state.laborEntries, entry] })),
            updateLaborEntry: (updated) =>
                set((state) => ({
                    laborEntries: state.laborEntries.map((e) =>
                        e.id === updated.id ? updated : e
                    ),
                })),
            deleteLaborEntry: (id) =>
                set((state) => ({
                    laborEntries: state.laborEntries.filter((e) => e.id !== id),
                })),

            // equipment
            setEquipmentEntries: (entries) => set({ equipmentEntries: entries }),
            addEquipmentEntry: (entry) =>
                set((state) => ({
                    equipmentEntries: [...state.equipmentEntries, entry],
                })),
            updateEquipmentEntry: (updated) =>
                set((state) => ({
                    equipmentEntries: state.equipmentEntries.map((e) =>
                        e.id === updated.id ? updated : e
                    ),
                })),
            deleteEquipmentEntry: (id) =>
                set((state) => ({
                    equipmentEntries: state.equipmentEntries.filter((e) => e.id !== id),
                })),

            // material
            setMaterialEntries: (entries) => set({ materialEntries: entries }),
            addMaterialEntry: (entry) =>
                set((state) => ({
                    materialEntries: [...state.materialEntries, entry],
                })),
            updateMaterialEntry: (updated) =>
                set((state) => ({
                    materialEntries: state.materialEntries.map((e) =>
                        e.id === updated.id ? updated : e
                    ),
                })),
            deleteMaterialEntry: (id) =>
                set((state) => ({
                    materialEntries: state.materialEntries.filter((e) => e.id !== id),
                })),
        }),
        {
            name: "timesheet-store",
            storage: {
                getItem: (name: string): StorageValue<TimesheetStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (
                    name: string,
                    value: StorageValue<TimesheetStore>
                ): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<TimesheetStore>,
        }
    )
);
