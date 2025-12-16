import { IClient } from "@/types/client";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface ClientStore {
    clients: IClient[];
    setClients: (clients: IClient[]) => void;
    addClient: (client: IClient) => void;
    updateClient: (updatedClient: IClient) => void;
    deleteClient: (clientId: string) => void;
}

export const useClientStore = create<ClientStore>()(
    persist(
        (set) => ({
            clients: [],
            setClients: (clients) => set({ clients }),
            addClient: (client) =>
                set((state) => ({ clients: [client, ...state.clients] })),
            updateClient: (updatedClient) =>
                set((state) => ({
                    clients: state.clients.map((client) =>
                        client.id === updatedClient.id ? updatedClient : client
                    ),
                })),
            deleteClient: (clientId) =>
                set((state) => ({
                    clients: state.clients.filter((client) => client.id !== clientId),
                })),
        }),
        {
            name: "client-store",
            storage: {
                getItem: (name: string): StorageValue<ClientStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<ClientStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<ClientStore>,
        }
    )
);
