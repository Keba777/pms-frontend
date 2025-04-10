// src/store/permissionsStore.ts
import { create } from "zustand";
import permissionsData from "@/data/roles.json";

// Define the shape of our permissions data
interface PermissionsJSON {
    [key: string]: {
        permissions: string[];
    };
}

const permissions = permissionsData as PermissionsJSON;

export type Role = keyof typeof permissions;

interface PermissionsState {
    currentRole: Role;
    setRole: (role: Role) => void;
    hasPermission: (permission: string) => boolean;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
    currentRole: "Admin",

    setRole: (role: Role) => set({ currentRole: role }),

    hasPermission: (permission: string): boolean => {
        const { currentRole } = get();
        const rolePermissions: string[] =
            permissions[currentRole]?.permissions || [];


        if (rolePermissions.includes("ALL")) return true;
        return rolePermissions.includes(permission);
    },
}));
