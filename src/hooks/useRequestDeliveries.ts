"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { RequestDelivery, CreateRequestDeliveryInput, UpdateRequestDeliveryInput } from "@/types/requestDelivery";
import { useRequestDeliveryStore } from "@/store/requestDeliveryStore.";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export const fetchRequestDeliveries = async (): Promise<RequestDelivery[]> => {
    const response = await apiClient.get<ApiResponse<RequestDelivery[]>>("/request-deliveries");
    return response.data.data;
};

export const fetchRequestDeliveryById = async (id: string): Promise<RequestDelivery | null> => {
    const response = await apiClient.get<ApiResponse<RequestDelivery>>(`/request-deliveries/${id}`);
    return response.data.data;
};

export const createRequestDelivery = async (data: CreateRequestDeliveryInput): Promise<RequestDelivery> => {
    const response = await apiClient.post<ApiResponse<RequestDelivery>>("/request-deliveries", data);
    return response.data.data;
};

export const updateRequestDelivery = async (data: UpdateRequestDeliveryInput): Promise<RequestDelivery> => {
    const response = await apiClient.put<ApiResponse<RequestDelivery>>(`/request-deliveries/${data.id}`, data);
    return response.data.data;
};

export const deleteRequestDelivery = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/request-deliveries/${id}`);
    return response.data.data;
};

export const useRequestDeliveries = () => {
    const setRequestDeliveries = useRequestDeliveryStore((state) => state.setRequestDeliveries);
    const query = useQuery({
        queryKey: ["request-deliveries"],
        queryFn: fetchRequestDeliveries,
    });

    useEffect(() => {
        if (query.data) {
            setRequestDeliveries(query.data);
        }
    }, [query.data, setRequestDeliveries]);

    return query;
};

export const useRequestDelivery = (id: string) => {
    return useQuery<RequestDelivery | null, Error>({
        queryKey: ["request-delivery", id],
        queryFn: () => fetchRequestDeliveryById(id),
        enabled: !!id,
    });
};

export const useCreateRequestDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRequestDelivery,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["request-deliveries"] });
            toast.success("Request Delivery created successfully");
            return data;
        },
        onError: (error) => {
            toast.error(`Error creating Request Delivery: ${error.message}`);
        },
    });
};

export const useUpdateRequestDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRequestDelivery,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["request-deliveries"] });
            toast.success("Request Delivery updated successfully");
            return data;
        },
        onError: (error) => {
            toast.error(`Error updating Request Delivery: ${error.message}`);
        },
    });
};

export const useDeleteRequestDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteRequestDelivery,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["request-deliveries"] });
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(`Error deleting Request Delivery: ${error.message}`);
        },
    });
};
