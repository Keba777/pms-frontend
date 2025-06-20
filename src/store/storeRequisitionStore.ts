import { StoreRequisition } from "@/types/storeRequisition";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface StoreRequisitionStore {
    storeRequisitions: StoreRequisition[];
    setStoreRequisitions: (items: StoreRequisition[]) => void;
    addStoreRequisition: (item: StoreRequisition) => void;
    updateStoreRequisition: (updated: StoreRequisition) => void;
    deleteStoreRequisition: (id: string) => void;
}

export const useStoreRequisitionStore = create<StoreRequisitionStore>()(
    persist(
        (set) => ({
            storeRequisitions: [],
            setStoreRequisitions: (items) => set({ storeRequisitions: items }),
            addStoreRequisition: (item) =>
                set((state) => ({
                    storeRequisitions: [...state.storeRequisitions, item],
                })),
            updateStoreRequisition: (updated) =>
                set((state) => ({
                    storeRequisitions: state.storeRequisitions.map((item) =>
                        item.id === updated.id ? updated : item
                    ),
                })),
            deleteStoreRequisition: (id) =>
                set((state) => ({
                    storeRequisitions: state.storeRequisitions.filter(
                        (item) => item.id !== id
                    ),
                })),
        }),
        {
            name: "store-requisition-store",
            storage: {
                getItem: (name: string): StorageValue<StoreRequisitionStore> | null => {
                    const json = localStorage.getItem(name);
                    return json ? JSON.parse(json) : null;
                },
                setItem: (
                    name: string,
                    value: StorageValue<StoreRequisitionStore>
                ): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<StoreRequisitionStore>,
        }
    )
);
