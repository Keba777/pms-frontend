// store/authStore.ts
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { User, Permissions } from "@/types/user";

export type PermissionAction = "create" | "edit" | "delete" | "manage";

interface AuthStore {
    user: User | null;
    token: string | null;
    permissions: Permissions | null;
    expiresAt: number | null;
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
            expiresAt: null,
            _hasHydrated: false,

            login: (user, token) => {
                const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
                set({
                    user,
                    token,
                    permissions: user.role?.permissions ?? null,
                    expiresAt,
                });
            },

            logout: () =>
                set({
                    user: null,
                    token: null,
                    permissions: null,
                    expiresAt: null,
                }),

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            hasPermission: (resource, action) => {
                const { user, permissions } = get();
                // Admin exceptions: these resources are restricted even for admins
                const adminExceptions = [
                    'site-labors',
                    'site-materials',
                    'site-equipments',
                ];

                // If user is admin
                if (user?.role?.name?.toLowerCase() === "admin") {
                    // Deny access if resource is in exceptions
                    if (adminExceptions.includes(resource)) {
                        return false;
                    }
                    return true;
                }

                // Non-admin permission check
                const resourcePerms =
                    (permissions?.[resource] as Record<string, boolean> | undefined) || {};
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
