// store/warehouseStore.ts
import { Warehouse } from "@/types/warehouse";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface WarehouseStore {
    warehouses: Warehouse[];
    setWarehouses: (warehouses: Warehouse[]) => void;
    addWarehouse: (warehouse: Warehouse) => void;
    updateWarehouse: (updatedWarehouse: Warehouse) => void;
    deleteWarehouse: (warehouseId: string) => void;
}

export const useWarehouseStore = create<WarehouseStore>()(
    persist(
        (set) => ({
            warehouses: [],
            setWarehouses: (warehouses) => set({ warehouses }),
            addWarehouse: (warehouse) =>
                set((state) => ({ warehouses: [...state.warehouses, warehouse] })),
            updateWarehouse: (updatedWarehouse) =>
                set((state) => ({
                    warehouses: state.warehouses.map((warehouse) =>
                        warehouse.id === updatedWarehouse.id ? updatedWarehouse : warehouse
                    ),
                })),
            deleteWarehouse: (warehouseId) =>
                set((state) => ({
                    warehouses: state.warehouses.filter(
                        (warehouse) => warehouse.id !== warehouseId
                    ),
                })),
        }),
        {
            name: "warehouse-store",
            storage: {
                getItem: (name: string): StorageValue<WarehouseStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<WarehouseStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<WarehouseStore>,
        }
    )
);
