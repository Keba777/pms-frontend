import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Todo {
    id: string
    text: string
    done: boolean
}

interface TodoStore {
    todos: Todo[]
    addTodo: (text: string) => void
    toggleTodo: (id: string) => void
    removeTodo: (id: string) => void
}

export const useTodoStore = create<TodoStore>()(
    persist(
        (set) => ({
            todos: [],
            addTodo: (text) =>
                set((state) => ({
                    todos: [
                        ...state.todos,
                        { id: crypto.randomUUID(), text, done: false },
                    ],
                })),
            toggleTodo: (id) =>
                set((state) => ({
                    todos: state.todos.map((todo) =>
                        todo.id === id ? { ...todo, done: !todo.done } : todo
                    ),
                })),
            removeTodo: (id) =>
                set((state) => ({
                    todos: state.todos.filter((todo) => todo.id !== id),
                })),
        }),
        { name: 'todos-storage' }
    )
)
