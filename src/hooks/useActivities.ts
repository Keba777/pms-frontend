"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Activity, CreateActivityInput, UpdateActivityInput } from "@/types/activity";
import { useActivityStore } from "@/store/activityStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions
// ----------------------------

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Activity[]>>("/activities");
    return response.data.data;
  } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch activities");
  }
};

const fetchActivityById = async (id: string): Promise<Activity | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Activity>>(`/activities/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    return null;
  }
};

const createActivity = async (data: CreateActivityInput): Promise<Activity> => {
  const response = await apiClient.post<ApiResponse<Activity>>("/activities", data);
  return response.data.data;
};

const updateActivity = async (data: UpdateActivityInput): Promise<Activity> => {
  const response = await apiClient.put<ApiResponse<Activity>>(`/activities/${data.id}`, data);
  return response.data.data;
};

const deleteActivity = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/activities/${id}`);
  return response.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------

// Hook to fetch all Activities and update the store
export const useActivities = () => {
  const setActivities = useActivityStore((state) => state.setActivities);
  const query = useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });

  useEffect(() => {
    if (query.data) {
      setActivities(query.data);
    }
  }, [query.data, setActivities]);

  return query;
};

// Hook to fetch a single Activity by ID
export const useActivity = (id: string) => {
  return useQuery<Activity | null, Error>({
    queryKey: ["activity", id],
    queryFn: () => fetchActivityById(id),
    enabled: !!id,
  });
};

// Hook to create a new Activity and update the store
export const useCreateActivity = (onSuccessCallback?: (activity: Activity) => void) => {
  const queryClient = useQueryClient();
  const addActivity = useActivityStore((state) => state.addActivity);
  return useMutation({
    mutationFn: createActivity,
    onSuccess: (activity) => {
      toast.success("Activity created successfully!");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      addActivity(activity);
      if (onSuccessCallback) onSuccessCallback(activity);
    },
    onError: () => {
      toast.error("Failed to create activity");
    },
  });
};

// Hook to update an Activity and update the store
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  const updateActivityInStore = useActivityStore((state) => state.updateActivity);
  return useMutation({
    mutationFn: updateActivity,
    onSuccess: (updatedActivity) => {
      toast.success("Activity updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      updateActivityInStore(updatedActivity);
    },
    onError: () => {
      toast.error("Failed to update activity");
    },
  });
};

// Hook to delete an Activity and update the store
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  const deleteActivityFromStore = useActivityStore((state) => state.deleteActivity);
  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (_, activityId) => {
      toast.success("Activity deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      deleteActivityFromStore(activityId);
    },
    onError: () => {
      toast.error("Failed to delete activity");
    },
  });
};
