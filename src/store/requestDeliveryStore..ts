import { RequestDelivery } from "@/types/requestDelivery";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface RequestDeliveryStore {
    requestDeliveries: RequestDelivery[];
    setRequestDeliveries: (requestDeliveries: RequestDelivery[]) => void;
    addRequestDelivery: (requestDelivery: RequestDelivery) => void;
    updateRequestDelivery: (updatedRequestDelivery: RequestDelivery) => void;
    deleteRequestDelivery: (requestDeliveryId: string) => void;
}
export const useRequestDeliveryStore = create<RequestDeliveryStore>()(
    persist(
        (set) => ({
            requestDeliveries: [],
            setRequestDeliveries: (requestDeliveries) => set({ requestDeliveries }),
            addRequestDelivery: (requestDelivery) =>
                set((state) => ({ requestDeliveries: [...state.requestDeliveries, requestDelivery] })),
            updateRequestDelivery: (updatedRequestDelivery) =>
                set((state) => ({
                    requestDeliveries: state.requestDeliveries.map((requestDelivery) =>
                        requestDelivery.id === updatedRequestDelivery.id ? updatedRequestDelivery : requestDelivery
                    ),
                })),
            deleteRequestDelivery: (requestDeliveryId) =>
                set((state) => ({
                    requestDeliveries: state.requestDeliveries.filter((requestDelivery) => requestDelivery.id !== requestDeliveryId),
                })),
        }),
        {
            name: "request-delivery-store",
            storage: {
                getItem: (name: string): StorageValue<RequestDeliveryStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<RequestDeliveryStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<RequestDeliveryStore>,
        }
    )
);