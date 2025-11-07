// hooks/useTasks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Task[]>>("/tasks");
    return response.data.data;
  } catch (error) {
    console.error(error);
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

const updateTaskActuals = async (payload: { id: string; actuals: any }): Promise<Task> => {
  // PATCH /tasks/:id/actuals
  const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${payload.id}/actuals`, { actuals: payload.actuals });
  return response.data.data;
};

const deleteTask = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
  return response.data.data;
};

const updateTaskProgress = async (data: any): Promise<Task> => {
  const { taskId, ...body } = data;
  const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}/progress`, body);
  return response.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------

export const useTasks = () => {
  const setTasks = useTaskStore((s) => s.setTasks);

  const query = useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    select: (tasks) =>
      tasks
        .slice()
        .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()),
  });

  useEffect(() => {
    if (query.data) setTasks(query.data);
  }, [query.data, setTasks]);

  return query;
};

export const useTask = (id: string) => {
  return useQuery<Task | null, Error>({
    queryKey: ["task", id],
    queryFn: () => fetchTaskById(id),
    enabled: !!id,
  });
};

export const useCreateTask = (onSuccess?: (task: Task) => void) => {
  const queryClient = useQueryClient();
  const addTask = useTaskStore((s) => s.addTask);
  return useMutation({
    mutationFn: createTask,
    onSuccess: (task) => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addTask(task);
      if (onSuccess) onSuccess(task);
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const updateTaskInStore = useTaskStore((s) => s.updateTask);
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

// new hook: update task actuals
export const useUpdateTaskActuals = () => {
  const queryClient = useQueryClient();
  const updateTaskInStore = useTaskStore((s) => s.updateTask);
  return useMutation({
    mutationFn: updateTaskActuals,
    onSuccess: (updatedTask) => {
      toast.success("Task actuals updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      updateTaskInStore(updatedTask);
    },
    onError: () => {
      toast.error("Failed to update task actuals");
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const deleteTaskFromStore = useTaskStore((s) => s.deleteTask);
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, taskId) => {
      toast.success("Task deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      deleteTaskFromStore(taskId as string);
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });
};

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  const updateTaskInStore = useTaskStore((s) => s.updateTask);

  return useMutation({
    mutationFn: updateTaskProgress,
    onSuccess: (updatedTask) => {
      toast.success("Task progress updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", updatedTask.id] });
      updateTaskInStore(updatedTask);
    },
    onError: () => {
      toast.error("Failed to update task progress");
    },
  });
};