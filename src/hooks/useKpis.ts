"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Kpi, CreateKpiInput, UpdateKpiInput } from "@/types/kpi";
import { useKPIStore } from "@/store/kpiStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export const fetchKpis = async (): Promise<Kpi[]> => {
    const response = await apiClient.get<ApiResponse<Kpi[]>>("/kpis");
    return response.data.data;
};

export const fetchKpiById = async (id: string): Promise<Kpi | null> => {
    const response = await apiClient.get<ApiResponse<Kpi>>(`/kpis/${id}`);
    return response.data.data;
};

export const createKpi = async (data: CreateKpiInput): Promise<Kpi> => {
    const response = await apiClient.post<ApiResponse<Kpi>>("/kpis", data);
    return response.data.data;
};

export const updateKpi = async (data: UpdateKpiInput): Promise<Kpi> => {
    const response = await apiClient.put<ApiResponse<Kpi>>(`/kpis/${data.id}`, data);
    return response.data.data;
}

export const deleteKpi = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/kpis/${id}`);
    return response.data.data;
}

export const useKpis = () => {
    const setKpis = useKPIStore((state) => state.setKPIs);
    const query = useQuery({
        queryKey: ["kpis"],
        queryFn: fetchKpis,
    });

    useEffect(() => {
        if (query.data) {
            setKpis(query.data);
        }
    }, [query.data, setKpis]);

    return query;
}

export const useKpi = (id: string) => {
    return useQuery<Kpi | null, Error>({
        queryKey: ["kpi", id],
        queryFn: () => fetchKpiById(id),
        enabled: !!id,
    });
};

export const useCreateKpi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createKpi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kpis"] });
            toast.success("KPI created successfully");
        },
        onError: (error) => {
            toast.error(`Error creating KPI: ${error.message}`);
        },
    });
};

export const useUpdateKpi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateKpi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kpis"] });
            toast.success("KPI updated successfully");
        },
        onError: (error) => {
            toast.error(`Error updating KPI: ${error.message}`);
        },
    });
};

export const useDeleteKpi = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteKpi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kpis"] });
            toast.success("KPI deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error deleting KPI: ${error.message}`);
        },
    });
};
