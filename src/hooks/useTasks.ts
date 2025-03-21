import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions (fixed)
// ----------------------------

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchTasks = async (): Promise<Task[]> => {
    try {
        const response = await apiClient.get<ApiResponse<Task[]>>("/tasks");
        return response.data.data;
    } catch (error) {
        throw new Error("Failed to fetch tasks");
    }
};

const fetchTaskById = async (id: string): Promise<Task | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching task:", error);
        return null;
    }
};

const createTask = async (data: CreateTaskInput): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>("/tasks", data);
    return response.data.data;
};

const updateTask = async (data: UpdateTaskInput): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${data.id}`, data);
    return response.data.data;
};

const deleteTask = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return response.data.data;
};

// ----------------------------
// Updated React Query hooks
// ----------------------------

// Hook to fetch all tasks and update the store
export const useTasks = () => {
    const setTasks = useTaskStore((state) => state.setTasks);
    const query = useQuery({
        queryKey: ["tasks"],
        queryFn: fetchTasks,
    });

    useEffect(() => {
        if (query.data) setTasks(query.data);
    }, [query.data, setTasks]);

    return query;
};

// Hook to fetch a single task by ID
export const useTask = (id: string) => {
    return useQuery<Task | null, Error>({
        queryKey: ["task", id],
        queryFn: () => fetchTaskById(id),
        enabled: !!id,
    });
};

// Hook to create a new task and update the store
export const useCreateTask = (onSuccess?: (task: Task) => void) => {
    const queryClient = useQueryClient();
    const addTask = useTaskStore((state) => state.addTask);
    return useMutation({
        mutationFn: createTask,
        onSuccess: (task) => {
            toast.success("Task created successfully!");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            addTask(task);
            if (onSuccess) onSuccess(task); // Call the onSuccess callback if provided
        },
        onError: () => {
            toast.error("Failed to create task");
        },
    });
};

// Hook to update a task and update the store
export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const updateTaskInStore = useTaskStore((state) => state.updateTask);
    return useMutation({
        mutationFn: updateTask,
        onSuccess: (updatedTask) => {
            toast.success("Task updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            updateTaskInStore(updatedTask);
        },
        onError: () => {
            toast.error("Failed to update task");
        },
    });
};

// Hook to delete a task and update the store
export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    const deleteTaskFromStore = useTaskStore((state) => state.deleteTask);
    return useMutation({
        mutationFn: deleteTask,
        onSuccess: (_, variables) => {
            toast.success("Task deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // variables is the task id in our deleteTask function
            deleteTaskFromStore(variables);
        },
        onError: () => {
            toast.error("Failed to delete task");
        },
    });
};
