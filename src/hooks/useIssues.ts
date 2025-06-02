"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import {
    Issue,
    CreateIssueInput,
    UpdateIssueInput,
} from "@/types/issue";
import { useIssueStore } from "@/store/issueStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchIssues = async (): Promise<Issue[]> => {
    const response = await apiClient.get<ApiResponse<Issue[]>>("/issues");
    return response.data.data;
};

const fetchIssueById = async (id: string): Promise<Issue | null> => {
    const response = await apiClient.get<ApiResponse<Issue>>(`/issues/${id}`);
    return response.data.data;
};

const createIssue = async (data: CreateIssueInput): Promise<Issue> => {
    const response = await apiClient.post<ApiResponse<Issue>>("/issues", data);
    return response.data.data;
};

const updateIssue = async (data: UpdateIssueInput): Promise<Issue> => {
    const response = await apiClient.put<ApiResponse<Issue>>(
        `/issues/${data.id}`,
        data
    );
    return response.data.data;
};

const deleteIssue = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<
        ApiResponse<{ message: string }>
    >(`/issues/${id}`);
    return response.data.data;
};

// Hook to fetch all Issues and update the store
export const useIssues = () => {
    const setIssues = useIssueStore((state) => state.setIssues);
    const query = useQuery({
        queryKey: ["issues"],
        queryFn: fetchIssues,
    });

    useEffect(() => {
        if (query.data) {
            setIssues(query.data);
        }
    }, [query.data, setIssues]);

    return query;
};

// Hook to fetch a single Issue by ID
export const useIssue = (id: string) => {
    return useQuery<Issue | null, Error>({
        queryKey: ["issue", id],
        queryFn: () => fetchIssueById(id),
        enabled: !!id,
    });
};

// Hook to create a new Issue and update the store
export const useCreateIssue = (
    onSuccessCallback?: (issue: Issue) => void
) => {
    const queryClient = useQueryClient();
    const addIssue = useIssueStore((state) => state.addIssue);
    return useMutation({
        mutationFn: createIssue,
        onSuccess: (issue) => {
            toast.success("Issue created successfully!");
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            addIssue(issue);
            if (onSuccessCallback) onSuccessCallback(issue);
        },
        onError: () => {
            toast.error("Failed to create issue");
        },
    });
};

// Hook to update an Issue and update the store
export const useUpdateIssue = () => {
    const queryClient = useQueryClient();
    const updateIssueInStore = useIssueStore((state) => state.updateIssue);
    return useMutation({
        mutationFn: updateIssue,
        onSuccess: (updatedIssue) => {
            toast.success("Issue updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            updateIssueInStore(updatedIssue);
        },
        onError: () => {
            toast.error("Failed to update issue");
        },
    });
};

// Hook to delete an Issue and update the store
export const useDeleteIssue = () => {
    const queryClient = useQueryClient();
    const deleteIssueFromStore = useIssueStore((state) => state.deleteIssue);
    return useMutation({
        mutationFn: deleteIssue,
        onSuccess: (_, issueId) => {
            toast.success("Issue deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["issues"] });
            deleteIssueFromStore(issueId);
        },
        onError: () => {
            toast.error("Failed to delete issue");
        },
    });
};
