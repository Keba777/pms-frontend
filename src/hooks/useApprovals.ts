"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Approval, CreateApprovalInput, UpdateApprovalInput } from "@/types/approval";
import { useApprovalStore } from "@/store/approvalStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchApprovals = async (): Promise<Approval[]> => {
    const response = await apiClient.get<ApiResponse<Approval[]>>("/approvals");
    return response.data.data;
};

const fetchApprovalById = async (id: string): Promise<Approval | null> => {
    const response = await apiClient.get<ApiResponse<Approval>>(`/approvals/${id}`);
    return response.data.data;
};

const createApproval = async (data: CreateApprovalInput): Promise<Approval> => {
    const response = await apiClient.post<ApiResponse<Approval>>("/approvals", data);
    return response.data.data;
};

const updateApproval = async (data: UpdateApprovalInput): Promise<Approval> => {
    const response = await apiClient.put<ApiResponse<Approval>>(`/approvals/${data.id}`, data);
    return response.data.data;
};

const deleteApproval = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/approvals/${id}`);
    return response.data.data;
};

// Hook to fetch all Approvals and update the store
export const useApprovals = () => {
    const setApprovals = useApprovalStore((state) => state.setApprovals);
    const query = useQuery({
        queryKey: ["approvals"],
        queryFn: fetchApprovals,
    });

    useEffect(() => {
        if (query.data) {
            setApprovals(query.data);
        }
    }, [query.data, setApprovals]);

    return query;
};

// Hook to fetch a single Approval by ID
export const useApproval = (id: string) => {
    return useQuery<Approval | null, Error>({
        queryKey: ["approval", id],
        queryFn: () => fetchApprovalById(id),
        enabled: !!id,
    });
};

// Hook to create a new Approval and update the store
export const useCreateApproval = (onSuccessCallback?: (approval: Approval) => void) => {
    const queryClient = useQueryClient();
    const addApproval = useApprovalStore((state) => state.addApproval);
    return useMutation({
        mutationFn: createApproval,
        onSuccess: (approval) => {
            toast.success("Approval created successfully!");
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            addApproval(approval);
            if (onSuccessCallback) onSuccessCallback(approval);
        },
        onError: () => {
            toast.error("Failed to create approval");
        },
    });
};

// Hook to update an Approval and update the store
export const useUpdateApproval = () => {
    const queryClient = useQueryClient();
    const updateApprovalInStore = useApprovalStore((state) => state.updateApproval);
    return useMutation({
        mutationFn: updateApproval,
        onSuccess: (updatedApproval) => {
            toast.success("Approval updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            updateApprovalInStore(updatedApproval);
        },
        onError: () => {
            toast.error("Failed to update approval");
        },
    });
};

// Hook to delete an Approval and update the store
export const useDeleteApproval = () => {
    const queryClient = useQueryClient();
    const deleteApprovalFromStore = useApprovalStore((state) => state.deleteApproval);
    return useMutation({
        mutationFn: deleteApproval,
        onSuccess: (_, approvalId) => {
            toast.success("Approval deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
            deleteApprovalFromStore(approvalId);
        },
        onError: () => {
            toast.error("Failed to delete approval");
        },
    });
};
