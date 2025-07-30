"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Dispatch, CreateDispatchInput, UpdateDispatchInput } from "@/types/dispatch";
import { useDispatchStore } from "@/store/dispatchStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// 🟡 Fetch All Dispatches
const fetchDispatches = async (): Promise<Dispatch[]> => {
    const response = await apiClient.get<ApiResponse<Dispatch[]>>("/dispatches");
    return response.data.data;
};

// 🟡 Fetch One Dispatch by ID
export const fetchDispatchById = async (id: string): Promise<Dispatch | null> => {
    const response = await apiClient.get<ApiResponse<Dispatch>>(`/dispatches/${id}`);
    return response.data.data;
};

// 🟢 Create New Dispatch
const createDispatch = async (data: CreateDispatchInput): Promise<Dispatch> => {
    const response = await apiClient.post<ApiResponse<Dispatch>>("/dispatches", data);
    return response.data.data;
};

// 🟠 Update Dispatch
const updateDispatch = async (data: UpdateDispatchInput): Promise<Dispatch> => {
    const response = await apiClient.put<ApiResponse<Dispatch>>(`/dispatches/${data.id}`, data);
    return response.data.data;
};

// 🔴 Delete Dispatch
const deleteDispatch = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/dispatches/${id}`);
    return response.data.data;
};

// Hook: Get All Dispatches
export const useDispatches = () => {
    const setDispatches = useDispatchStore((state) => state.setDispatches);
    const query = useQuery({
        queryKey: ["dispatches"],
        queryFn: fetchDispatches,
    });

    useEffect(() => {
        if (query.data) {
            setDispatches(query.data);
        }
    }, [query.data, setDispatches]);

    return query;
};

// Hook: Get Dispatch by ID
export const useDispatch = (id: string) => {
    return useQuery<Dispatch | null, Error>({
        queryKey: ["dispatch", id],
        queryFn: () => fetchDispatchById(id),
        enabled: !!id,
    });
};

// ✅ Hook: Create Dispatch
export const useCreateDispatch = (onSuccessCallback?: (dispatch: Dispatch) => void) => {
    const queryClient = useQueryClient();
    const addDispatch = useDispatchStore((state) => state.addDispatch);

    return useMutation({
        mutationFn: createDispatch,
        onSuccess: (dispatch) => {
            toast.success("Dispatch created successfully!");
            queryClient.invalidateQueries({ queryKey: ["dispatches"] });
            addDispatch(dispatch);
            if (onSuccessCallback) onSuccessCallback(dispatch);
        },
        onError: () => {
            toast.error("Failed to create dispatch");
        },
    });
};

// ✅ Hook: Update Dispatch
export const useUpdateDispatch = () => {
    const queryClient = useQueryClient();
    const updateDispatchInStore = useDispatchStore((state) => state.updateDispatch);

    return useMutation({
        mutationFn: updateDispatch,
        onSuccess: (updatedDispatch) => {
            toast.success("Dispatch updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["dispatches"] });
            updateDispatchInStore(updatedDispatch);
        },
        onError: () => {
            toast.error("Failed to update dispatch");
        },
    });
};

// ✅ Hook: Delete Dispatch
export const useDeleteDispatch = () => {
    const queryClient = useQueryClient();
    const deleteDispatchFromStore = useDispatchStore((state) => state.deleteDispatch);

    return useMutation({
        mutationFn: deleteDispatch,
        onSuccess: (_, id) => {
            toast.success("Dispatch deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["dispatches"] });
            deleteDispatchFromStore(id);
        },
        onError: () => {
            toast.error("Failed to delete dispatch");
        },
    });
};
