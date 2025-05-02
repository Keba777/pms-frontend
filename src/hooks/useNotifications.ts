"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { toast } from "react-toastify";
import {
    Notification,
    NotificationCreatePayload,
    NotificationUpdatePayload,
} from "@/types/notification";
import { useNotificationStore } from "@/store/notificationStore";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// ----------------------------
// API functions
// ----------------------------
const fetchNotifications = async (): Promise<Notification[]> => {
    const res = await apiClient.get<ApiResponse<Notification[]>>("/notifications/my");
    return res.data.data;
};

const fetchNotificationById = async (id: string): Promise<Notification> => {
    const res = await apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
    return res.data.data;
};

const createNotification = async (
    payload: NotificationCreatePayload
): Promise<Notification> => {
    const res = await apiClient.post<ApiResponse<Notification>>(
        "/notifications",
        payload
    );
    return res.data.data;
};

const updateNotification = async (
    payload: NotificationUpdatePayload
): Promise<Notification> => {
    const res = await apiClient.put<ApiResponse<Notification>>(
        `/notifications/${payload.id}`,
        payload
    );
    return res.data.data;
};

const deleteNotification = async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/notifications/${id}`
    );
    return res.data.data;
};

const markAsRead = async (id: string): Promise<Notification> => {
    const res = await apiClient.patch<ApiResponse<Notification>>(
        `/notifications/${id}/read`
    );
    return res.data.data;
};

const markAllAsRead = async (): Promise<{ message: string }> => {
    const res = await apiClient.patch<ApiResponse<{ message: string }>>(
        `/notifications/read-all`
    );
    return res.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------

export const useNotifications = () => {
    const setNotifications = useNotificationStore((s) => s.setNotifications);
    const query = useQuery<Notification[], Error>({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
    });

    useEffect(() => {
        if (query.data) {
            setNotifications(query.data);
        }
    }, [query.data, setNotifications]);

    return query;
};

export const useNotification = (id: string) => {
    return useQuery<Notification, Error>({
        queryKey: ["notification", id],
        queryFn: () => fetchNotificationById(id),
        enabled: Boolean(id),
    });
};

export const useCreateNotification = (
    onSuccessCallback?: (n: Notification) => void
) => {
    const queryClient = useQueryClient();
    const addNotification = useNotificationStore((s) => s.addNotification);

    return useMutation({
        mutationFn: createNotification,
        onSuccess: (n) => {
            toast.success("Notification created");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            addNotification(n);
            onSuccessCallback?.(n);
        },
        onError: () => {
            toast.error("Failed to create notification");
        },
    });
};

export const useUpdateNotification = () => {
    const queryClient = useQueryClient();
    const updateInStore = useNotificationStore((s) => s.updateNotification);

    return useMutation({
        mutationFn: updateNotification,
        onSuccess: (n) => {
            toast.success("Notification updated");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            updateInStore(n);
        },
        onError: () => {
            toast.error("Failed to update notification");
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    const deleteFromStore = useNotificationStore((s) => s.deleteNotification);

    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: (_, id) => {
            toast.success("Notification deleted");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            deleteFromStore(id);
        },
        onError: () => {
            toast.error("Failed to delete notification");
        },
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    const markReadInStore = useNotificationStore((s) => s.markRead);

    return useMutation({
        mutationFn: markAsRead,
        onSuccess: (n) => {
            toast.success("Marked as read");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            markReadInStore(n.id!);
        },
        onError: () => {
            toast.error("Failed to mark as read");
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    const markAllInStore = useNotificationStore((s) => s.markAllRead);

    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            toast.success("All marked as read");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            markAllInStore();
        },
        onError: () => {
            toast.error("Failed to mark all as read");
        },
    });
};
