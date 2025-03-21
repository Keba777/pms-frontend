// store/authStore.ts
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { User } from "@/types/user";

interface AuthStore {
    user: User | null;
    token: string | null;
    _hasHydrated: boolean; // Add hydration state
    login: (user: User, token: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void; // Add hydration setter
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            _hasHydrated: false,
            login: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: "auth-store",
            storage: {
                getItem: (name) => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name, value) => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<AuthStore>,
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            }
        }
    )
);