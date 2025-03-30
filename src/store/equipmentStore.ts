// store/equipmentStore.ts
import { Equipment } from "@/types/equipment";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface EquipmentStore {
    equipments: Equipment[];
    setEquipments: (equipments: Equipment[]) => void;
    addEquipment: (equipment: Equipment) => void;
    updateEquipment: (updatedEquipment: Equipment) => void;
    deleteEquipment: (equipmentId: string) => void;
}

export const useEquipmentStore = create<EquipmentStore>()(
    persist(
        (set) => ({
            equipments: [],
            setEquipments: (equipments) => set({ equipments }),
            addEquipment: (equipment) =>
                set((state) => ({ equipments: [...state.equipments, equipment] })),
            updateEquipment: (updatedEquipment) =>
                set((state) => ({
                    equipments: state.equipments.map((equipment) =>
                        equipment.id === updatedEquipment.id ? updatedEquipment : equipment
                    ),
                })),
            deleteEquipment: (equipmentId) =>
                set((state) => ({
                    equipments: state.equipments.filter(
                        (equipment) => equipment.id !== equipmentId
                    ),
                })),
        }),
        {
            name: "equipment-store",
            storage: {
                getItem: (name: string): StorageValue<EquipmentStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<EquipmentStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<EquipmentStore>,
        }
    )
);
