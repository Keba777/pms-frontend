// store/authStore.ts
import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import { User, Permissions } from "@/types/user";

export type PermissionAction = "create" | "edit" | "update" | "delete" | "manage" | "view";

interface AuthStore {
    user: User | null;
    token: string | null;
    permissions: string[] | null;
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
                const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
                set({
                    user,
                    token,
                    permissions: user.permissions ?? null, // Use flattened permissions from backend
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
                const { permissions, user } = get();

                // Super Admins have access to everything
                if (user?.role?.name?.toLowerCase() === "superadmin") {
                    return true;
                }

                if (!permissions) return false;

                // Check for wildcard first
                if (permissions.includes('*')) return true;

                // Normalize action: map 'edit' to 'update' to match backend
                const normalizedAction = action === 'edit' ? 'update' : action;

                // Check specific permission slug
                const slug = `${resource}:${normalizedAction}`;
                return permissions.includes(slug);
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
