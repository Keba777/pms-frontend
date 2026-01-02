"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Todo, CreateTodoInput, UpdateTodoInput, TodoProgress, CreateTodoProgressInput } from "@/types/todo";
import { useTodoStore, useTodoProgressStore } from "@/store/todoStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions
// ----------------------------
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// ----- Todo API -----
const fetchTodos = async (): Promise<Todo[]> => {
    const response = await apiClient.get<ApiResponse<Todo[]>>("/todos");
    return response.data.data;
};

const fetchTodoById = async (id: string): Promise<Todo | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Todo>>(`/todos/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching todo:", error);
        return null;
    }
};

const createTodo = async (data: CreateTodoInput): Promise<Todo> => {
    const formData = new FormData();
    formData.append("task", data.task);
    formData.append("type", data.type);
    formData.append("priority", data.priority);
    formData.append("dueDate", data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate);
    if (data.target_date) formData.append("target_date", data.target_date instanceof Date ? data.target_date.toISOString() : data.target_date);
    formData.append("departmentId", data.departmentId);
    if (data.status) formData.append("status", data.status);
    if (data.progress !== undefined) formData.append("progress", data.progress.toString());
    if (data.remark) formData.append("remark", data.remark);
    if (data.remainder) formData.append("remainder", data.remainder);

    if (data.assignedUsers && data.assignedUsers.length > 0) {
        data.assignedUsers.forEach((id) => formData.append("assignedUsers", id));
    }

    if (data.target && data.target.length > 0) {
        data.target.forEach((t) => formData.append("target", t));
    }

    if (data.attachment && data.attachment.length > 0) {
        data.attachment.forEach((file) => formData.append("attachments", file));
    }

    const response = await apiClient.post<ApiResponse<Todo>>("/todos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
};

const updateTodo = async (data: UpdateTodoInput): Promise<Todo> => {
    const formData = new FormData();
    if (data.id) formData.append("id", data.id);
    if (data.task) formData.append("task", data.task);
    if (data.type) formData.append("type", data.type);
    if (data.priority) formData.append("priority", data.priority);
    if (data.dueDate) formData.append("dueDate", data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate);
    if (data.target_date) formData.append("target_date", data.target_date instanceof Date ? data.target_date.toISOString() : data.target_date);
    if (data.departmentId) formData.append("departmentId", data.departmentId);
    if (data.status) formData.append("status", data.status);
    if (data.progress !== undefined) formData.append("progress", data.progress.toString());
    if (data.remark) formData.append("remark", data.remark);
    if (data.remainder) formData.append("remainder", data.remainder);

    if (data.assignedUsers) {
        data.assignedUsers.forEach((id) => formData.append("assignedUsers", id));
    }

    if (data.target) {
        data.target.forEach((t) => formData.append("target", t));
    }

    if (data.existingAttachments) {
        data.existingAttachments.forEach((url) => formData.append("existingAttachments", url));
    }

    if (data.attachment && data.attachment.length > 0) {
        data.attachment.forEach((file) => formData.append("attachments", file));
    }

    const response = await apiClient.put<ApiResponse<Todo>>(`/todos/${data.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
};

const deleteTodo = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/todos/${id}`);
    return response.data.data;
};

// ----- Progress API -----
const createTodoProgress = async (data: CreateTodoProgressInput): Promise<TodoProgress> => {
    const formData = new FormData();
    formData.append("progress", String(data.progress));
    if (data.remark) formData.append("remark", data.remark);
    if (data.attachment?.length) {
        data.attachment.forEach((file) => {
            formData.append("attachments", file);
        });
    }

    const response = await apiClient.post<ApiResponse<TodoProgress>>(
        `/todos/${data.todoId}/progress`,
        formData,
        {
            headers: { "Content-Type": "multipart/form-data" },
        }
    );
    return response.data.data;
};


// ----------------------------
// React Query hooks
// ----------------------------

import { useSearchStore } from "@/store/searchStore";

// Fetch all todos
export const useTodos = () => {
    const setTodos = useTodoStore((s) => s.setTodos);
    const searchQuery = useSearchStore((s) => s.searchQuery);

    const query = useQuery<Todo[], Error>({
        queryKey: ["todos"],
        queryFn: fetchTodos,
        select: (todos) => {
            const filtered = todos.filter((t) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                    t.task.toLowerCase().includes(q) ||
                    t.type.toLowerCase().includes(q) ||
                    t.remark?.toLowerCase().includes(q) ||
                    t.priority.toLowerCase().includes(q) ||
                    t.status.toLowerCase().includes(q)
                );
            });

            return filtered
                .slice()
                .sort(
                    (a, b) =>
                        new Date(a.createdAt!).getTime() -
                        new Date(b.createdAt!).getTime()
                );
        }
    });

    useEffect(() => {
        if (query.data) setTodos(query.data);
    }, [query.data, setTodos]);

    return query;
};

// Fetch a single todo by ID
export const useTodo = (id: string) => {
    return useQuery<Todo | null, Error>({
        queryKey: ["todo", id],
        queryFn: () => fetchTodoById(id),
        enabled: !!id,
    });
};

// Create a todo
export const useCreateTodo = (onSuccess?: (todo: Todo) => void) => {
    const queryClient = useQueryClient();
    const addTodo = useTodoStore((state) => state.addTodo);

    return useMutation({
        mutationFn: createTodo,
        onSuccess: (todo) => {
            toast.success("Todo created successfully!");
            queryClient.invalidateQueries({ queryKey: ["todos"] });
            addTodo(todo);
            if (onSuccess) onSuccess(todo);
        },
        onError: () => {
            toast.error("Failed to create todo");
        },
    });
};

// Update a todo
export const useUpdateTodo = () => {
    const queryClient = useQueryClient();
    const updateTodoInStore = useTodoStore((state) => state.updateTodo);

    return useMutation({
        mutationFn: updateTodo,
        onSuccess: (updatedTodo) => {
            toast.success("Todo updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["todos"] });
            updateTodoInStore(updatedTodo);
        },
        onError: () => {
            toast.error("Failed to update todo");
        },
    });
};

// Delete a todo
export const useDeleteTodo = () => {
    const queryClient = useQueryClient();
    const deleteTodoFromStore = useTodoStore((state) => state.deleteTodo);

    return useMutation({
        mutationFn: deleteTodo,
        onSuccess: (_, variables) => {
            toast.success("Todo deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["todos"] });
            deleteTodoFromStore(variables);
        },
        onError: () => {
            toast.error("Failed to delete todo");
        },
    });
};

// ----------------------------
// Progress Hooks
// ----------------------------
export const useCreateTodoProgress = (onSuccess?: (progress: TodoProgress) => void) => {
    const addProgressUpdate = useTodoProgressStore((s) => s.addProgressUpdate);

    return useMutation({
        mutationFn: createTodoProgress,
        onSuccess: (progress) => {
            toast.success("Progress update added!");
            addProgressUpdate(progress);
            if (onSuccess) onSuccess(progress);
        },
        onError: () => {
            toast.error("Failed to add progress update");
        },
    });
};
