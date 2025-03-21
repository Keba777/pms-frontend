import { Role, User } from "@/types/user";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface UserStore {
    user: User | null;
    role: Role | null;
    setUser: (user: User) => void;
    updateUser: (updatedUser: User) => void;
    clearUser: () => void;
    setRole: (role: Role) => void;
    clearRole: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            role: null,
            setUser: (user) => set({ user }),
            updateUser: (updatedUser) => set({ user: updatedUser }),
            clearUser: () => set({ user: null }),
            setRole: (role) => set({ role }),
            clearRole: () => set({ role: null }),
        }),
        {
            name: "user-store", // Name for the local storage key
            storage: {
                getItem: (name: string): StorageValue<UserStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<UserStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<UserStore>,
        }
    )
);
