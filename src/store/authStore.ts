import { User } from "@/types/user";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface AuthStore {
    user: User | null;
    token: string | null;
    login: (user: any, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: "auth-store",
            storage: {
                getItem: (name: string): StorageValue<AuthStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<AuthStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<AuthStore>,
        }
    )
);
