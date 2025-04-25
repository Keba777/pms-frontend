"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Labor, CreateLaborInput, UpdateLaborInput } from "@/types/labor";
import { useLaborStore } from "@/store/laborStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchLabors = async (): Promise<Labor[]> => {
    const response = await apiClient.get<ApiResponse<Labor[]>>("/labors");
    return response.data.data;
};

export const fetchLaborById = async (id: string): Promise<Labor | null> => {
    const response = await apiClient.get<ApiResponse<Labor>>(`/labors/${id}`);
    return response.data.data;
};

const createLabor = async (data: CreateLaborInput): Promise<Labor> => {
    const response = await apiClient.post<ApiResponse<Labor>>("/labors", data);
    return response.data.data;
};

const updateLabor = async (data: UpdateLaborInput): Promise<Labor> => {
    const response = await apiClient.put<ApiResponse<Labor>>(`/labors/${data.id}`, data);
    return response.data.data;
};

const deleteLabor = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/labors/${id}`);
    return response.data.data;
};

// Hook to fetch all Labors and update the store
export const useLabors = () => {
    const setLabors = useLaborStore((state) => state.setLabors);
    const query = useQuery({
        queryKey: ["labors"],
        queryFn: fetchLabors,
    });

    useEffect(() => {
        if (query.data) {
            setLabors(query.data);
        }
    }, [query.data, setLabors]);

    return query;
};

// Hook to fetch a single Labor by ID
export const useLabor = (id: string) => {
    return useQuery<Labor | null, Error>({
        queryKey: ["labor", id],
        queryFn: () => fetchLaborById(id),
        enabled: !!id,
    });
};

// Hook to create a new Labor and update the store
export const useCreateLabor = (onSuccessCallback?: (labor: Labor) => void) => {
    const queryClient = useQueryClient();
    const addLabor = useLaborStore((state) => state.addLabor);
    return useMutation({
        mutationFn: createLabor,
        onSuccess: (labor) => {
            toast.success("Labor created successfully!");
            queryClient.invalidateQueries({ queryKey: ["labors"] });
            addLabor(labor);
            if (onSuccessCallback) onSuccessCallback(labor);
        },
        onError: () => {
            toast.error("Failed to create labor");
        },
    });
};

// Hook to update a Labor and update the store
export const useUpdateLabor = () => {
    const queryClient = useQueryClient();
    const updateLaborInStore = useLaborStore((state) => state.updateLabor);
    return useMutation({
        mutationFn: updateLabor,
        onSuccess: (updatedLabor) => {
            toast.success("Labor updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["labors"] });
            updateLaborInStore(updatedLabor);
        },
        onError: () => {
            toast.error("Failed to update labor");
        },
    });
};

// Hook to delete a Labor and update the store
export const useDeleteLabor = () => {
    const queryClient = useQueryClient();
    const deleteLaborFromStore = useLaborStore((state) => state.deleteLabor);
    return useMutation({
        mutationFn: deleteLabor,
        onSuccess: (_, laborId) => {
            toast.success("Labor deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["labors"] });
            deleteLaborFromStore(laborId);
        },
        onError: () => {
            toast.error("Failed to delete labor");
        },
    });
};
