// store/roleStore.ts
import { Role } from "@/types/user";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface RoleStore {
    roles: Role[];
    setRoles: (roles: Role[]) => void;
    addRole: (role: Role) => void;
    updateRole: (updatedRole: Role) => void;
    deleteRole: (roleId: string) => void;
}

export const useRoleStore = create<RoleStore>()(
    persist(
        (set) => ({
            roles: [],
            setRoles: (roles) => set({ roles }),
            addRole: (role) =>
                set((state) => ({ roles: [...state.roles, role] })),
            updateRole: (updatedRole) =>
                set((state) => ({
                    roles: state.roles.map((role) =>
                        role.id === updatedRole.id ? updatedRole : role
                    ),
                })),
            deleteRole: (roleId) =>
                set((state) => ({
                    roles: state.roles.filter((role) => role.id !== roleId),
                })),
        }),
        {
            name: "role-store",
            storage: {
                getItem: (name: string): StorageValue<RoleStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<RoleStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<RoleStore>,
        }
    )
);
