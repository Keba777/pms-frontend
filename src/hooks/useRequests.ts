"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Request, CreateRequestInput, UpdateRequestInput } from "@/types/request";
import { useRequestStore } from "@/store/requestStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchRequests = async (): Promise<Request[]> => {
    const response = await apiClient.get<ApiResponse<Request[]>>("/requests");
    return response.data.data;
};

const fetchRequestById = async (id: string): Promise<Request | null> => {
    const response = await apiClient.get<ApiResponse<Request>>(`/requests/${id}`);
    return response.data.data;
};

const createRequest = async (data: CreateRequestInput): Promise<Request> => {
    const response = await apiClient.post<ApiResponse<Request>>("/requests", data);
    return response.data.data;
};

const updateRequest = async (data: UpdateRequestInput): Promise<Request> => {
    const response = await apiClient.put<ApiResponse<Request>>(`/requests/${data.id}`, data);
    return response.data.data;
};

const deleteRequest = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/requests/${id}`);
    return response.data.data;
};

// Hook to fetch all Requests and update the store
export const useRequests = () => {
    const setRequests = useRequestStore((state) => state.setRequests);
    const query = useQuery({
        queryKey: ["requests"],
        queryFn: fetchRequests,
    });

    useEffect(() => {
        if (query.data) {
            setRequests(query.data);
        }
    }, [query.data, setRequests]);

    return query;
};

// Hook to fetch a single Request by ID
export const useRequest = (id: string) => {
    return useQuery<Request | null, Error>({
        queryKey: ["request", id],
        queryFn: () => fetchRequestById(id),
        enabled: !!id,
    });
};

// Hook to create a new Request and update the store
export const useCreateRequest = (onSuccessCallback?: (request: Request) => void) => {
    const queryClient = useQueryClient();
    const addRequest = useRequestStore((state) => state.addRequest);
    return useMutation({
        mutationFn: createRequest,
        onSuccess: (request) => {
            toast.success("Request created successfully!");
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            addRequest(request);
            if (onSuccessCallback) onSuccessCallback(request);
        },
        onError: () => {
            toast.error("Failed to create request");
        },
    });
};

// Hook to update a Request and update the store
export const useUpdateRequest = () => {
    const queryClient = useQueryClient();
    const updateRequestInStore = useRequestStore((state) => state.updateRequest);
    return useMutation({
        mutationFn: updateRequest,
        onSuccess: (updatedRequest) => {
            toast.success("Request updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            updateRequestInStore(updatedRequest);
        },
        onError: () => {
            toast.error("Failed to update request");
        },
    });
};

// Hook to delete a Request and update the store
export const useDeleteRequest = () => {
    const queryClient = useQueryClient();
    const deleteRequestFromStore = useRequestStore((state) => state.deleteRequest);
    return useMutation({
        mutationFn: deleteRequest,
        onSuccess: (_, requestId) => {
            toast.success("Request deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            deleteRequestFromStore(requestId);
        },
        onError: () => {
            toast.error("Failed to delete request");
        },
    });
};
