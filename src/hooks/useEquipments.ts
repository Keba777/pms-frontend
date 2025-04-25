"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Equipment, CreateEquipmentInput, UpdateEquipmentInput } from "@/types/equipment";
import { useEquipmentStore } from "@/store/equipmentStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchEquipments = async (): Promise<Equipment[]> => {
    const response = await apiClient.get<ApiResponse<Equipment[]>>("/equipments");
    return response.data.data;
};

export const fetchEquipmentById = async (id: string): Promise<Equipment | null> => {
    const response = await apiClient.get<ApiResponse<Equipment>>(`/equipments/${id}`);
    return response.data.data;
};

const createEquipment = async (data: CreateEquipmentInput): Promise<Equipment> => {
    const response = await apiClient.post<ApiResponse<Equipment>>("/equipments", data);
    return response.data.data;
};

const updateEquipment = async (data: UpdateEquipmentInput): Promise<Equipment> => {
    const response = await apiClient.put<ApiResponse<Equipment>>(`/equipments/${data.id}`, data);
    return response.data.data;
};

const deleteEquipment = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/equipments/${id}`);
    return response.data.data;
};

// Hook to fetch all Equipments and update the store
export const useEquipments = () => {
    const setEquipments = useEquipmentStore((state) => state.setEquipments);
    const query = useQuery({
        queryKey: ["equipments"],
        queryFn: fetchEquipments,
    });

    useEffect(() => {
        if (query.data) {
            setEquipments(query.data);
        }
    }, [query.data, setEquipments]);

    return query;
};

// Hook to fetch a single Equipment by ID
export const useEquipment = (id: string) => {
    return useQuery<Equipment | null, Error>({
        queryKey: ["equipment", id],
        queryFn: () => fetchEquipmentById(id),
        enabled: !!id,
    });
};

// Hook to create a new Equipment and update the store
export const useCreateEquipment = (onSuccessCallback?: (equipment: Equipment) => void) => {
    const queryClient = useQueryClient();
    const addEquipment = useEquipmentStore((state) => state.addEquipment);
    return useMutation({
        mutationFn: createEquipment,
        onSuccess: (equipment) => {
            toast.success("Equipment created successfully!");
            queryClient.invalidateQueries({ queryKey: ["equipments"] });
            addEquipment(equipment);
            if (onSuccessCallback) onSuccessCallback(equipment);
        },
        onError: () => {
            toast.error("Failed to create equipment");
        },
    });
};

// Hook to update an Equipment and update the store
export const useUpdateEquipment = () => {
    const queryClient = useQueryClient();
    const updateEquipmentInStore = useEquipmentStore((state) => state.updateEquipment);
    return useMutation({
        mutationFn: updateEquipment,
        onSuccess: (updatedEquipment) => {
            toast.success("Equipment updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["equipments"] });
            updateEquipmentInStore(updatedEquipment);
        },
        onError: () => {
            toast.error("Failed to update equipment");
        },
    });
};

// Hook to delete an Equipment and update the store
export const useDeleteEquipment = () => {
    const queryClient = useQueryClient();
    const deleteEquipmentFromStore = useEquipmentStore((state) => state.deleteEquipment);
    return useMutation({
        mutationFn: deleteEquipment,
        onSuccess: (_, equipmentId) => {
            toast.success("Equipment deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["equipments"] });
            deleteEquipmentFromStore(equipmentId);
        },
        onError: () => {
            toast.error("Failed to delete equipment");
        },
    });
};
