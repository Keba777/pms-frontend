import { Role, User } from "@/types/user";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface UserStore {
    user: User | null;
    users: User[];
    role: Role | null;

    setUser: (user: User) => void;
    setUsers: (users: User[]) => void;
    updateUser: (updatedUser: User) => void;
    updateUserInList: (updatedUser: User) => void;
    clearUser: () => void;
    setRole: (role: Role) => void;
    clearRole: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set, get) => ({
            user: null,
            users: [],
            role: null,

            setUser: (user) => set({ user }),
            setUsers: (users) => set({ users }),
            updateUser: (updatedUser) => set({ user: updatedUser }),
            updateUserInList: (updatedUser) =>
                set((state) => ({
                    users: state.users.map((user) =>
                        user.id === updatedUser.id ? updatedUser : user
                    ),
                })),
            clearUser: () => set({ user: null }),
            setRole: (role) => set({ role }),
            clearRole: () => set({ role: null }),
        }),
        {
            name: "user-store",
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
