// store/todoStore.ts
import { Todo } from "@/types/todo";
import { TodoProgress } from "@/types/todo";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

// =======================
// Todo Store
// =======================
interface TodoStore {
    todos: Todo[];
    setTodos: (todos: Todo[]) => void;
    addTodo: (todo: Todo) => void;
    updateTodo: (updatedTodo: Todo) => void;
    deleteTodo: (todoId: string) => void;
}

export const useTodoStore = create<TodoStore>()(
    persist(
        (set) => ({
            todos: [],
            setTodos: (todos) => set({ todos }),
            addTodo: (todo) =>
                set((state) => ({ todos: [...state.todos, todo] })),
            updateTodo: (updatedTodo) =>
                set((state) => ({
                    todos: state.todos.map((todo) =>
                        todo.id === updatedTodo.id ? updatedTodo : todo
                    ),
                })),
            deleteTodo: (todoId) =>
                set((state) => ({
                    todos: state.todos.filter((todo) => todo.id !== todoId),
                })),
        }),
        {
            name: "todo-store",
            storage: {
                getItem: (name: string): StorageValue<TodoStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<TodoStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<TodoStore>,
        }
    )
);

// =======================
// Todo Progress Store
// =======================
interface TodoProgressStore {
    progressUpdates: TodoProgress[];
    addProgressUpdate: (progress: TodoProgress) => void;
}

export const useTodoProgressStore = create<TodoProgressStore>()(
    persist(
        (set) => ({
            progressUpdates: [],
            addProgressUpdate: (progress) =>
                set((state) => ({
                    progressUpdates: [...state.progressUpdates, progress],
                })),
        }),
        {
            name: "todo-progress-store",
            storage: {
                getItem: (name: string): StorageValue<TodoProgressStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<TodoProgressStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<TodoProgressStore>,
        }
    )
);
