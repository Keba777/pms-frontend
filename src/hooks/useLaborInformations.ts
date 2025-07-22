"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { LaborInformation, CreateLaborInformationInput, UpdateLaborInformationInput } from "@/types/laborInformation";
import { useLaborInformationStore } from "@/store/laborInformationStore";
import { toast } from "react-toastify";
import { useEffect } from "react";
    
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchLaborInformations = async (): Promise<LaborInformation[]> => {
    const response = await apiClient.get<ApiResponse<LaborInformation[]>>("/labor-informations");
    return response.data.data;
};

export const fetchLaborInformationById = async (id: string): Promise<LaborInformation | null> => {
    const response = await apiClient.get<ApiResponse<LaborInformation>>(`/labor-informations/${id}`);
    return response.data.data;
};

const createLaborInformation = async (data: CreateLaborInformationInput): Promise<LaborInformation> => {
    const response = await apiClient.post<ApiResponse<LaborInformation>>("/labor-informations", data);
    return response.data.data;
};

const updateLaborInformation = async (data: UpdateLaborInformationInput): Promise<LaborInformation> => {
    const response = await apiClient.put<ApiResponse<LaborInformation>>(`/labor-informations/${data.id}`, data);
    return response.data.data;
}

const deleteLaborInformation = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/labor-informations/${id}`);
    return response.data.data;
};

export const useLaborInformations = () => {
    const setLaborInformations = useLaborInformationStore((state) => state.setLaborInformations);
    const query = useQuery({
        queryKey: ["labor-informations"],
        queryFn: fetchLaborInformations,
    });

    useEffect(() => {
        if (query.data) {
            setLaborInformations(query.data);
        }
    }, [query.data, setLaborInformations]);

    return query;
}

export const useLaborInformation = (id: string) => {
    return useQuery<LaborInformation | null, Error>({
        queryKey: ["labor-information", id],
        queryFn: () => fetchLaborInformationById(id),
        enabled: !!id,
    });
};

export const useCreateLaborInformation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createLaborInformation,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["labor-informations"] });
            toast.success("Labor Information created successfully");
        },
        onError: (error) => {
            toast.error(`Error creating Labor Information: ${error.message}`);
        },
    });
};

export const useUpdateLaborInformation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateLaborInformation,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["labor-informations"] });
            toast.success("Labor Information updated successfully");
        },
        onError: (error) => {
            toast.error(`Error updating Labor Information: ${error.message}`);
        },
    });
};

export const useDeleteLaborInformation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteLaborInformation,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["labor-informations"] });
            toast.success("Labor Information deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error deleting Labor Information: ${error.message}`);
        },
    });
}