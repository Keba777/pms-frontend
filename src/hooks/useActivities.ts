"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import {
  Activity,
  Actuals,
  CreateActivityInput,
} from "@/types/activity";
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
    console.log(error);
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

const createActivity = async (data: CreateActivityInput | FormData): Promise<Activity> => {
  const response = await apiClient.post<ApiResponse<Activity>>("/activities", data);
  return response.data.data;
};

// Keep generic activity update (if used elsewhere)
const updateActivity = async (data: (Partial<CreateActivityInput> & { id: string }) | FormData): Promise<Activity> => {
  const id = data instanceof FormData ? data.get("id")?.toString() : data.id;
  if (!id) throw new Error("Activity ID is missing");
  const response = await apiClient.put<ApiResponse<Activity>>(`/activities/${id}`, data);
  return response.data.data;
};

const updateActivityActuals = async (data: { id: string; actuals: Actuals }): Promise<Activity> => {
  const response = await apiClient.patch<ApiResponse<Activity>>(`/activities/${data.id}/actuals`, { actuals: data.actuals });
  return response.data.data;
};

const deleteActivity = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/activities/${id}`);
  return response.data.data;
};

/**
 * Payload for updating activity progress.
 * activityId is used in the URL; the rest is the request body.
 */
export interface UpdateActivityProgressPayload {
  activityId: string;
  progress: number;
  remark?: string;
  status?: string;
  checkedBy?: string;
  approvedBy?: string;
  action?: string;
  summaryReport?: string;
  comment?: string;
  approvedDate?: string | null;
  dateTime?: string;
  userId?: string;
}

/**
 * Calls PUT /activities/:id/progress with the correct body.
 * The server will append a progressUpdate entry and update activity.progress.
 */
const updateActivityProgress = async (payload: UpdateActivityProgressPayload): Promise<Activity> => {
  const { activityId, ...body } = payload;
  const response = await apiClient.put<ApiResponse<Activity>>(`/activities/${activityId}/progress`, body);
  return response.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------

import { useSearchStore } from "@/store/searchStore";

export const useActivities = () => {
  const setActivities = useActivityStore((s) => s.setActivities);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery<Activity[], Error>({
    queryKey: ["activities"],
    queryFn: fetchActivities,
    select: (activities) => {
      const filtered = activities.filter((a) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.activity_name.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.status?.toLowerCase().includes(q)
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
    if (query.data) {
      setActivities(query.data);
    }
  }, [query.data, setActivities]);

  return query;
};

export const useActivity = (id: string) => {
  return useQuery<Activity | null, Error>({
    queryKey: ["activity", id],
    queryFn: () => fetchActivityById(id),
    enabled: !!id,
  });
};

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

export const useUpdateActivityActuals = () => {
  const queryClient = useQueryClient();
  const updateActivityInStore = useActivityStore((state) => state.updateActivity);
  return useMutation({
    mutationFn: updateActivityActuals,
    onSuccess: (updatedActivity) => {
      toast.success("Activity actuals updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      updateActivityInStore(updatedActivity);
    },
    onError: () => {
      toast.error("Failed to update activity actuals");
    },
  });
};

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

/**
 * Hook to update activity progress (uses PUT /activities/:id/progress)
 * Accepts UpdateActivityProgressPayload (activityId + body)
 */
export const useUpdateActivityProgress = () => {
  const queryClient = useQueryClient();
  const updateActivityInStore = useActivityStore((state) => state.updateActivity);

  return useMutation({
    mutationFn: updateActivityProgress,
    onSuccess: (updatedActivity) => {
      toast.success("Activity progress updated successfully!");
      // refresh lists and single activity cache
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["activity", updatedActivity.id] });
      // update store
      updateActivityInStore(updatedActivity);
    },
    onError: () => {
      toast.error("Failed to update activity progress");
    },
  });
};
