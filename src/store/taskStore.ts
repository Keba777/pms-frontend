// store/taskStore.ts
import { Task } from "@/types/task";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface TaskStore {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (updatedTask: Task) => void;
    deleteTask: (taskId: string) => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set) => ({
            tasks: [],
            setTasks: (tasks) => set({ tasks }),
            addTask: (task) =>
                set((state) => ({ tasks: [...state.tasks, task] })),
            updateTask: (updatedTask) =>
                set((state) => ({
                    tasks: state.tasks.map((task) =>
                        task.id === updatedTask.id ? updatedTask : task
                    ),
                })),
            deleteTask: (taskId) =>
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== taskId),
                })),
        }),
        {
            name: "task-store",
            storage: {
                getItem: (name: string): StorageValue<TaskStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<TaskStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<TaskStore>,
        }
    )
);
