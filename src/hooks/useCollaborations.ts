"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { toast } from "react-toastify";
import {
  AppActivity,
  AppDiscussion,
  AppNotification,
  CreateActivityInput,
  CreateDiscussionInput,
  CreateNotificationInput,
  UpdateActivityInput,
  UpdateDiscussionInput,
  UpdateNotificationInput,
} from "@/types/collaboration";
import {
  useActivityStore,
  useDiscussionStore,
  useNotificationStore,
} from "@/store/collaborationStore";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchDiscussions = async (): Promise<AppDiscussion[]> => {
  const res = await apiClient.get<ApiResponse<AppDiscussion[]>>("/collaborations/discussions");
  return res.data.data;
};

const fetchDiscussionById = async (
  id: number | string
): Promise<AppDiscussion | null> => {
  try {
    const res = await apiClient.get<ApiResponse<AppDiscussion>>(
      `/collaborations/discussions/${id}`
    );
    return res.data.data;
  } catch (err) {
    console.error("Error fetching discussion:", err);
    return null;
  }
};

const createDiscussionApi = async (
  payload: CreateDiscussionInput
): Promise<AppDiscussion> => {
  const res = await apiClient.post<ApiResponse<AppDiscussion>>(
    "/collaborations/discussions",
    payload
  );
  return res.data.data;
};

const updateDiscussionApi = async (
  payload: UpdateDiscussionInput
): Promise<AppDiscussion> => {
  const res = await apiClient.put<ApiResponse<AppDiscussion>>(
    `/collaborations/discussions/${payload.id}`,
    payload
  );
  return res.data.data;
};

const deleteDiscussionApi = async (
  id: number | string
): Promise<{ message: string }> => {
  const res = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/collaborations/discussions/${id}`
  );
  return res.data.data;
};

import { useSearchStore } from "@/store/searchStore";

// Hooks
export const useDiscussions = () => {
  const setDiscussions = useDiscussionStore((s) => s.setDiscussions);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery<AppDiscussion[], Error>({
    queryKey: ["discussions"],
    queryFn: fetchDiscussions,
    select: (data) => {
      const filtered = data.filter((d) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          d.subject.toLowerCase().includes(q) ||
          d.body.toLowerCase().includes(q)
        );
      });
      return filtered;
    }
  });

  if (query.data) setDiscussions(query.data);
  return query;
};

// ... existing code ...

// Hooks
export const useNotifications = () => {
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery<AppNotification[], Error>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    select: (data) => {
      const filtered = data.filter((n) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
        );
      });
      return filtered;
    }
  });

  if (query.data) setNotifications(query.data);
  return query;
};

// ... existing code ...

// Hooks
export const useActivities = () => {
  const setActivities = useActivityStore((s) => s.setActivities);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery<AppActivity[], Error>({
    queryKey: ["activities"],
    queryFn: fetchActivities,
    select: (data) => {
      const filtered = data.filter((a) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.action.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
        );
      });
      return filtered;
    }
  });

  if (query.data) setActivities(query.data);
  return query;
};

export const useDiscussion = (id?: number | string) =>
  useQuery<AppDiscussion | null, Error>({
    queryKey: ["discussion", id],
    queryFn: () => (id ? fetchDiscussionById(id) : Promise.resolve(null)),
    enabled: !!id,
  });

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  const addDiscussion = useDiscussionStore((s) => s.addDiscussion);

  return useMutation({
    mutationFn: createDiscussionApi,
    onSuccess: (newDiscussion) => {
      toast.success("Discussion created");
      addDiscussion(newDiscussion);
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onError: () => toast.error("Failed to create discussion"),
  });
};

export const useUpdateDiscussion = () => {
  const queryClient = useQueryClient();
  const updateInStore = useDiscussionStore((s) => s.updateDiscussion);

  return useMutation({
    mutationFn: updateDiscussionApi,
    onSuccess: (updated) => {
      toast.success("Discussion updated");
      updateInStore(updated);
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["discussion", updated.id] });
    },
    onError: () => toast.error("Failed to update discussion"),
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  const deleteFromStore = useDiscussionStore((s) => s.deleteDiscussion);

  return useMutation({
    mutationFn: deleteDiscussionApi,
    onSuccess: (_, id) => {
      toast.success("Discussion deleted");
      deleteFromStore(id as number | string);
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
    },
    onError: () => toast.error("Failed to delete discussion"),
  });
};

const fetchNotifications = async (): Promise<AppNotification[]> => {
  const res = await apiClient.get<ApiResponse<AppNotification[]>>(
    "/collaborations/notifications"
  );
  return res.data.data;
};

const fetchNotificationById = async (
  id: number | string
): Promise<AppNotification | null> => {
  try {
    const res = await apiClient.get<ApiResponse<AppNotification>>(
      `/collaborations/notifications/${id}`
    );
    return res.data.data;
  } catch (err) {
    console.error("Error fetching notification:", err);
    return null;
  }
};

const createNotificationApi = async (
  payload: CreateNotificationInput
): Promise<AppNotification> => {
  const res = await apiClient.post<ApiResponse<AppNotification>>(
    "/collaborations/notifications",
    payload
  );
  return res.data.data;
};

const updateNotificationApi = async (
  payload: UpdateNotificationInput
): Promise<AppNotification> => {
  const res = await apiClient.put<ApiResponse<AppNotification>>(
    `/collaborations/notifications/${payload.id}`,
    payload
  );
  return res.data.data;
};

const deleteNotificationApi = async (
  id: number | string
): Promise<{ message: string }> => {
  const res = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/collaborations/notifications/${id}`
  );
  return res.data.data;
};

// Hooks
// useNotifications is now defined above

export const useNotification = (id?: number | string) =>
  useQuery<AppNotification | null, Error>({
    queryKey: ["notification", id],
    queryFn: () => (id ? fetchNotificationById(id) : Promise.resolve(null)),
    enabled: !!id,
  });

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.addNotification);

  return useMutation({
    mutationFn: createNotificationApi,
    onSuccess: (newNotification) => {
      toast.success("Notification created");
      addNotification(newNotification);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to create notification"),
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  const updateInStore = useNotificationStore((s) => s.updateNotification);

  return useMutation({
    mutationFn: updateNotificationApi,
    onSuccess: (updated) => {
      toast.success("Notification updated");
      updateInStore(updated);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", updated.id] });
    },
    onError: () => toast.error("Failed to update notification"),
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const deleteFromStore = useNotificationStore((s) => s.deleteNotification);

  return useMutation({
    mutationFn: deleteNotificationApi,
    onSuccess: (_, id) => {
      toast.success("Notification deleted");
      deleteFromStore(id as number | string);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("Failed to delete notification"),
  });
};

/* =======================
   React Query hooks for Activities
   ======================= */

const fetchActivities = async (): Promise<AppActivity[]> => {
  const res = await apiClient.get<ApiResponse<AppActivity[]>>("/collaborations/activity-logs");
  return res.data.data;
};

const fetchActivityById = async (
  id: number | string
): Promise<AppActivity | null> => {
  try {
    const res = await apiClient.get<ApiResponse<AppActivity>>(
      `/collaborations/activity-logs/${id}`
    );
    return res.data.data;
  } catch (err) {
    console.error("Error fetching activity:", err);
    return null;
  }
};

const createActivityApi = async (
  payload: CreateActivityInput
): Promise<AppActivity> => {
  const res = await apiClient.post<ApiResponse<AppActivity>>(
    "/collaborations/activity-logs",
    payload
  );
  return res.data.data;
};

const updateActivityApi = async (
  payload: UpdateActivityInput
): Promise<AppActivity> => {
  const res = await apiClient.put<ApiResponse<AppActivity>>(
    `/collaborations/activity-logs/${payload.id}`,
    payload
  );
  return res.data.data;
};

const deleteActivityApi = async (
  id: number | string
): Promise<{ message: string }> => {
  const res = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/collaborations/activity-logs/${id}`
  );
  return res.data.data;
};

// Hooks
// useActivities is now defined above

export const useActivity = (id?: number | string) =>
  useQuery<AppActivity | null, Error>({
    queryKey: ["activity", id],
    queryFn: () => (id ? fetchActivityById(id) : Promise.resolve(null)),
    enabled: !!id,
  });

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const addActivity = useActivityStore((s) => s.addActivity);

  return useMutation({
    mutationFn: createActivityApi,
    onSuccess: (newActivity) => {
      toast.success("Activity logged");
      addActivity(newActivity);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: () => toast.error("Failed to create activity"),
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  const updateInStore = useActivityStore((s) => s.updateActivity);

  return useMutation({
    mutationFn: updateActivityApi,
    onSuccess: (updated) => {
      toast.success("Activity updated");
      updateInStore(updated);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["activity", updated.id] });
    },
    onError: () => toast.error("Failed to update activity"),
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  const deleteFromStore = useActivityStore((s) => s.deleteActivity);

  return useMutation({
    mutationFn: deleteActivityApi,
    onSuccess: (_, id) => {
      toast.success("Activity deleted");
      deleteFromStore(id as number | string);
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: () => toast.error("Failed to delete activity"),
  });
};
