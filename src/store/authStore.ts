// store/authStore.ts
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { User, Permissions } from "@/types/user";

export type PermissionAction = "create" | "edit" | "delete" | "manage";

interface AuthStore {
    user: User | null;
    token: string | null;
    permissions: Permissions | null;
    _hasHydrated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
    hasPermission: (resource: string, action: PermissionAction) => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            permissions: null,
            _hasHydrated: false,

            login: (user, token) => {
                set({
                    user,
                    token,
                    permissions: user.role?.permissions ?? null,
                });
            },

            logout: () => set({ user: null, token: null, permissions: null }),

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            hasPermission: (resource, action) => {
                const resourcePerms =
                    (get().permissions?.[resource] as Record<string, boolean> | undefined) || {};
                return Boolean(resourcePerms[action]);
            },
        }),
        {
            name: "auth-store",
            storage: {
                getItem: (name) => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name, value) =>
                    localStorage.setItem(name, JSON.stringify(value)),
                removeItem: (name) => localStorage.removeItem(name),
            } as PersistStorage<AuthStore>,
            onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
        }
    )
);
