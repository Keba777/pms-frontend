"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Material, CreateMaterialInput, UpdateMaterialInput } from "@/types/material";
import { useMaterialStore } from "@/store/materialStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchMaterials = async (): Promise<Material[]> => {
    const response = await apiClient.get<ApiResponse<Material[]>>("/materials");
    return response.data.data;
};

const fetchMaterialById = async (id: string): Promise<Material | null> => {
    const response = await apiClient.get<ApiResponse<Material>>(`/materials/${id}`);
    return response.data.data;
};

const createMaterial = async (data: CreateMaterialInput): Promise<Material> => {
    const response = await apiClient.post<ApiResponse<Material>>("/materials", data);
    return response.data.data;
};

const updateMaterial = async (data: UpdateMaterialInput): Promise<Material> => {
    const response = await apiClient.put<ApiResponse<Material>>(`/materials/${data.id}`, data);
    return response.data.data;
};

const deleteMaterial = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/materials/${id}`);
    return response.data.data;
};

// Hook to fetch all Materials and update the store
export const useMaterials = () => {
    const setMaterials = useMaterialStore((state) => state.setMaterials);
    const query = useQuery({
        queryKey: ["materials"],
        queryFn: fetchMaterials,
    });

    useEffect(() => {
        if (query.data) {
            setMaterials(query.data);
        }
    }, [query.data, setMaterials]);

    return query;
};

// Hook to fetch a single Material by ID
export const useMaterial = (id: string) => {
    return useQuery<Material | null, Error>({
        queryKey: ["material", id],
        queryFn: () => fetchMaterialById(id),
        enabled: !!id,
    });
};

// Hook to create a new Material and update the store
export const useCreateMaterial = (onSuccessCallback?: (material: Material) => void) => {
    const queryClient = useQueryClient();
    const addMaterial = useMaterialStore((state) => state.addMaterial);
    return useMutation({
        mutationFn: createMaterial,
        onSuccess: (material) => {
            toast.success("Material created successfully!");
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            addMaterial(material);
            if (onSuccessCallback) onSuccessCallback(material);
        },
        onError: () => {
            toast.error("Failed to create material");
        },
    });
};

// Hook to update a Material and update the store
export const useUpdateMaterial = () => {
    const queryClient = useQueryClient();
    const updateMaterialInStore = useMaterialStore((state) => state.updateMaterial);
    return useMutation({
        mutationFn: updateMaterial,
        onSuccess: (updatedMaterial) => {
            toast.success("Material updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            updateMaterialInStore(updatedMaterial);
        },
        onError: () => {
            toast.error("Failed to update material");
        },
    });
};

// Hook to delete a Material and update the store
export const useDeleteMaterial = () => {
    const queryClient = useQueryClient();
    const deleteMaterialFromStore = useMaterialStore((state) => state.deleteMaterial);
    return useMutation({
        mutationFn: deleteMaterial,
        onSuccess: (_, materialId) => {
            toast.success("Material deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            deleteMaterialFromStore(materialId);
        },
        onError: () => {
            toast.error("Failed to delete material");
        },
    });
};
