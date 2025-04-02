// store/departmentStore.ts
import { Department } from "@/types/department";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface DepartmentStore {
    departments: Department[];
    setDepartments: (departments: Department[]) => void;
    addDepartment: (department: Department) => void;
    updateDepartment: (updatedDepartment: Department) => void;
    deleteDepartment: (departmentId: string) => void;
}

export const useDepartmentStore = create<DepartmentStore>()(
    persist(
        (set) => ({
            departments: [],
            setDepartments: (departments) => set({ departments }),
            addDepartment: (department) =>
                set((state) => ({ departments: [...state.departments, department] })),
            updateDepartment: (updatedDepartment) =>
                set((state) => ({
                    departments: state.departments.map((department) =>
                        department.id === updatedDepartment.id ? updatedDepartment : department
                    ),
                })),
            deleteDepartment: (departmentId) =>
                set((state) => ({
                    departments: state.departments.filter(
                        (department) => department.id !== departmentId
                    ),
                })),
        }),
        {
            name: "department-store",
            storage: {
                getItem: (name: string): StorageValue<DepartmentStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<DepartmentStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<DepartmentStore>,
        }
    )
);
