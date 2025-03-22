import apiClient from "@/services/api-client";
import { useTagStore } from "@/store/tagStore";
import { Tag } from "@/types/tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// API functions for Tags
const fetchTags = async (): Promise<Tag[]> => {
    try {
        const response = await apiClient.get<ApiResponse<Tag[]>>("/tags");
        return response.data.data;
    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch tags");
    }
};

const fetchTagById = async (id: string): Promise<Tag | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Tag>>(`/tags/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching tag:", error);
        return null;
    }
};

const createTag = async (data: Tag): Promise<Tag> => {
    const response = await apiClient.post<ApiResponse<Tag>>("/tags", data);
    return response.data.data;
};

const updateTag = async (data: Tag): Promise<Tag> => {
    const response = await apiClient.put<ApiResponse<Tag>>(`/tags/${data.id}`, data);
    return response.data.data;
};

const deleteTag = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/tags/${id}`);
    return response.data.data;
};

// Hook to fetch all tags and update the store
export const useTags = () => {
    const setTags = useTagStore((state) => state.setTags);
    const query = useQuery({
        queryKey: ["tags"],
        queryFn: fetchTags,
    });

    useEffect(() => {
        if (query.data) setTags(query.data);
    }, [query.data, setTags]);

    return query;
};

// Hook to fetch a single tag by ID
export const useTag = (id: string) => {
    return useQuery<Tag | null, Error>({
        queryKey: ["tag", id],
        queryFn: () => fetchTagById(id),
        enabled: !!id,
    });
};

// Hook to create a new tag and update the store
export const useCreateTag = (onSuccess?: (tag: Tag) => void) => {
    const queryClient = useQueryClient();
    const addTag = useTagStore((state) => state.addTag);
    return useMutation({
        mutationFn: createTag,
        onSuccess: (tag) => {
            toast.success("Tag created successfully!");
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            addTag(tag);
            if (onSuccess) onSuccess(tag); // Call the onSuccess callback if provided
        },
        onError: () => {
            toast.error("Failed to create tag");
        },
    });
};

// Hook to update a tag and update the store
export const useUpdateTag = () => {
    const queryClient = useQueryClient();
    const updateTagInStore = useTagStore((state) => state.updateTag);
    return useMutation({
        mutationFn: updateTag,
        onSuccess: (updatedTag) => {
            toast.success("Tag updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            updateTagInStore(updatedTag);
        },
        onError: () => {
            toast.error("Failed to update tag");
        },
    });
};

// Hook to delete a tag and update the store
export const useDeleteTag = () => {
    const queryClient = useQueryClient();
    const deleteTagFromStore = useTagStore((state) => state.deleteTag);
    return useMutation({
        mutationFn: deleteTag,
        onSuccess: (_, variables) => {
            toast.success("Tag deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            // variables is the tag id in our deleteTag function
            deleteTagFromStore(variables);
        },
        onError: () => {
            toast.error("Failed to delete tag");
        },
    });
};

