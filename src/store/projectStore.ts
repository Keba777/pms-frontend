// store/projectStore.ts
import { Project } from "@/types/project";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface ProjectStore {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (updatedProject: Project) => void;
    deleteProject: (projectId: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
    persist(
        (set) => ({
            projects: [],
            setProjects: (projects) => set({ projects }),
            addProject: (project) =>
                set((state) => ({ projects: [...state.projects, project] })),
            updateProject: (updatedProject) =>
                set((state) => ({
                    projects: state.projects.map((project) =>
                        project.id === updatedProject.id ? updatedProject : project
                    ),
                })),
            deleteProject: (projectId) =>
                set((state) => ({
                    projects: state.projects.filter((project) => project.id !== projectId),
                })),
        }),
        {
            name: "project-store",
            storage: {
                getItem: (name: string): StorageValue<ProjectStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<ProjectStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<ProjectStore>,
        }
    )
);
