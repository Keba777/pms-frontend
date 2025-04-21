// store/requestStore.ts
import { Request } from "@/types/request";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface RequestStore {
    requests: Request[];
    setRequests: (requests: Request[]) => void;
    addRequest: (request: Request) => void;
    updateRequest: (updatedRequest: Request) => void;
    deleteRequest: (requestId: string) => void;
}

export const useRequestStore = create<RequestStore>()(
    persist(
        (set) => ({
            requests: [],
            setRequests: (requests) => set({ requests }),
            addRequest: (request) =>
                set((state) => ({ requests: [...state.requests, request] })),
            updateRequest: (updatedRequest) =>
                set((state) => ({
                    requests: state.requests.map((request) =>
                        request.id === updatedRequest.id ? updatedRequest : request
                    ),
                })),
            deleteRequest: (requestId) =>
                set((state) => ({
                    requests: state.requests.filter(
                        (request) => request.id !== requestId
                    ),
                })),
        }),
        {
            name: "request-store",
            storage: {
                getItem: (name: string): StorageValue<RequestStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<RequestStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<RequestStore>,
        }
    )
);
