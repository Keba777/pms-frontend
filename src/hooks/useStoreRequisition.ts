"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import {
    StoreRequisition,
    CreateStoreRequisitionInput,
    UpdateStoreRequisitionInput,
} from "@/types/storeRequisition";
import { useStoreRequisitionStore } from "@/store/storeRequisitionStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchStoreRequisitions = async (): Promise<StoreRequisition[]> => {
    const response = await apiClient.get<ApiResponse<StoreRequisition[]>>(
        "/store-requisitions"
    );
    return response.data.data;
};

const fetchStoreRequisitionById = async (
    id: string
): Promise<StoreRequisition | null> => {
    const response = await apiClient.get<ApiResponse<StoreRequisition>>(
        `/store-requisitions/${id}`
    );
    return response.data.data;
};

const createStoreRequisition = async (
    data: CreateStoreRequisitionInput
): Promise<StoreRequisition> => {
    const response = await apiClient.post<ApiResponse<StoreRequisition>>(
        "/store-requisitions",
        data
    );
    return response.data.data;
};

const updateStoreRequisition = async (
    data: UpdateStoreRequisitionInput
): Promise<StoreRequisition> => {
    const response = await apiClient.put<ApiResponse<StoreRequisition>>(
        `/store-requisitions/${data.id}`,
        data
    );
    return response.data.data;
};

const deleteStoreRequisition = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/store-requisitions/${id}`
    );
    return response.data.data;
};

// Hook to fetch all store requisitions and sync to store
export const useStoreRequisitions = () => {
    const setStoreRequisitions = useStoreRequisitionStore(
        (state) => state.setStoreRequisitions
    );
    const query = useQuery({
        queryKey: ["storeRequisitions"],
        queryFn: fetchStoreRequisitions,
    });

    useEffect(() => {
        if (query.data) {
            setStoreRequisitions(query.data);
        }
    }, [query.data, setStoreRequisitions]);

    return query;
};

// Hook to fetch a single store requisition by ID
export const useStoreRequisition = (id: string) => {
    return useQuery<StoreRequisition | null, Error>({
        queryKey: ["storeRequisition", id],
        queryFn: () => fetchStoreRequisitionById(id),
        enabled: Boolean(id),
    });
};

// Hook to create a new store requisition
export const useCreateStoreRequisition = (
    onSuccessCallback?: (sr: StoreRequisition) => void
) => {
    const queryClient = useQueryClient();
    const addStoreRequisition = useStoreRequisitionStore(
        (state) => state.addStoreRequisition
    );

    return useMutation({
        mutationFn: createStoreRequisition,
        onSuccess: (sr) => {
            toast.success("Store requisition created!");
            queryClient.invalidateQueries({ queryKey: ["storeRequisitions"] });
            addStoreRequisition(sr);
            if (onSuccessCallback) onSuccessCallback(sr);
        },
        onError: () => {
            toast.error("Failed to create store requisition");
        },
    });
};

// Hook to update an existing store requisition
export const useUpdateStoreRequisition = () => {
    const queryClient = useQueryClient();
    const updateInStore = useStoreRequisitionStore(
        (state) => state.updateStoreRequisition
    );

    return useMutation({
        mutationFn: updateStoreRequisition,
        onSuccess: (updated) => {
            toast.success("Store requisition updated!");
            queryClient.invalidateQueries({ queryKey: ["storeRequisitions"] });
            updateInStore(updated);
        },
        onError: () => {
            toast.error("Failed to update store requisition");
        },
    });
};

// Hook to delete a store requisition
export const useDeleteStoreRequisition = () => {
    const queryClient = useQueryClient();
    const deleteFromStore = useStoreRequisitionStore(
        (state) => state.deleteStoreRequisition
    );

    return useMutation({
        mutationFn: deleteStoreRequisition,
        onSuccess: (_, id) => {
            toast.success("Store requisition deleted!");
            queryClient.invalidateQueries({ queryKey: ["storeRequisitions"] });
            deleteFromStore(id);
        },
        onError: () => {
            toast.error("Failed to delete store requisition");
        },
    });
};
