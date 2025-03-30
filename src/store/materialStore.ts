// store/materialStore.ts
import { Material } from "@/types/material";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface MaterialStore {
    materials: Material[];
    setMaterials: (materials: Material[]) => void;
    addMaterial: (material: Material) => void;
    updateMaterial: (updatedMaterial: Material) => void;
    deleteMaterial: (materialId: string) => void;
}

export const useMaterialStore = create<MaterialStore>()(
    persist(
        (set) => ({
            materials: [],
            setMaterials: (materials) => set({ materials }),
            addMaterial: (material) =>
                set((state) => ({ materials: [...state.materials, material] })),
            updateMaterial: (updatedMaterial) =>
                set((state) => ({
                    materials: state.materials.map((material) =>
                        material.id === updatedMaterial.id ? updatedMaterial : material
                    ),
                })),
            deleteMaterial: (materialId) =>
                set((state) => ({
                    materials: state.materials.filter(
                        (material) => material.id !== materialId
                    ),
                })),
        }),
        {
            name: "material-store",
            storage: {
                getItem: (name: string): StorageValue<MaterialStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<MaterialStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<MaterialStore>,
        }
    )
);
