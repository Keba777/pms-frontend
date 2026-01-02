"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Warehouse, CreateWarehouseInput, UpdateWarehouseInput } from "@/types/warehouse";
import { useWarehouseStore } from "@/store/warehouseStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchWarehouses = async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<ApiResponse<Warehouse[]>>("/warehouses");
    return response.data.data;
};

const fetchWarehouseById = async (id: string): Promise<Warehouse | null> => {
    const response = await apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data;
};

const createWarehouse = async (data: CreateWarehouseInput): Promise<Warehouse> => {
    const response = await apiClient.post<ApiResponse<Warehouse>>("/warehouses", data);
    return response.data.data;
};

const updateWarehouse = async (data: UpdateWarehouseInput): Promise<Warehouse> => {
    const response = await apiClient.put<ApiResponse<Warehouse>>(`/warehouses/${data.id}`, data);
    return response.data.data;
};

const deleteWarehouse = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/warehouses/${id}`);
    return response.data.data;
};

import { useSearchStore } from "@/store/searchStore";

// Hook to fetch all Warehouses and update the store
export const useWarehouses = () => {
    const setWarehouses = useWarehouseStore((state) => state.setWarehouses);
    const searchQuery = useSearchStore((s) => s.searchQuery);

    const query = useQuery({
        queryKey: ["warehouses"],
        queryFn: fetchWarehouses,
        select: (warehouses) => {
            const filtered = warehouses.filter((w) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                    w.type.toLowerCase().includes(q) ||
                    w.owner.toLowerCase().includes(q) ||
                    w.remark?.toLowerCase().includes(q) ||
                    w.status.toLowerCase().includes(q)
                );
            });
            return filtered;
        }
    });

    useEffect(() => {
        if (query.data) {
            setWarehouses(query.data);
        }
    }, [query.data, setWarehouses]);

    return query;
};

// Hook to fetch a single Warehouse by ID
export const useWarehouse = (id: string) => {
    return useQuery<Warehouse | null, Error>({
        queryKey: ["warehouse", id],
        queryFn: () => fetchWarehouseById(id),
        enabled: !!id,
    });
};

// Hook to create a new Warehouse and update the store
export const useCreateWarehouse = (onSuccessCallback?: (warehouse: Warehouse) => void) => {
    const queryClient = useQueryClient();
    const addWarehouse = useWarehouseStore((state) => state.addWarehouse);
    return useMutation({
        mutationFn: createWarehouse,
        onSuccess: (warehouse) => {
            toast.success("Warehouse created successfully!");
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            addWarehouse(warehouse);
            if (onSuccessCallback) onSuccessCallback(warehouse);
        },
        onError: () => {
            toast.error("Failed to create warehouse");
        },
    });
};

// Hook to update a Warehouse and update the store
export const useUpdateWarehouse = () => {
    const queryClient = useQueryClient();
    const updateWarehouseInStore = useWarehouseStore((state) => state.updateWarehouse);
    return useMutation({
        mutationFn: updateWarehouse,
        onSuccess: (updatedWarehouse) => {
            toast.success("Warehouse updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            updateWarehouseInStore(updatedWarehouse);
        },
        onError: () => {
            toast.error("Failed to update warehouse");
        },
    });
};

// Hook to delete a Warehouse and update the store
export const useDeleteWarehouse = () => {
    const queryClient = useQueryClient();
    const deleteWarehouseFromStore = useWarehouseStore((state) => state.deleteWarehouse);
    return useMutation({
        mutationFn: deleteWarehouse,
        onSuccess: (_, warehouseId) => {
            toast.success("Warehouse deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["warehouses"] });
            deleteWarehouseFromStore(warehouseId);
        },
        onError: () => {
            toast.error("Failed to delete warehouse");
        },
    });
};
