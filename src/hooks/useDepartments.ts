"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Department, CreateDepartmentInput, UpdateDepartmentInput } from "@/types/department";
import { useDepartmentStore } from "@/store/departmentStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchDepartments = async (): Promise<Department[]> => {
    const response = await apiClient.get<ApiResponse<Department[]>>("/departments");
    return response.data.data;
};

const fetchDepartmentById = async (id: string): Promise<Department | null> => {
    const response = await apiClient.get<ApiResponse<Department>>(`/departments/${id}`);
    return response.data.data;
};

const createDepartment = async (data: CreateDepartmentInput): Promise<Department> => {
    const response = await apiClient.post<ApiResponse<Department>>("/departments", data);
    return response.data.data;
};

const updateDepartment = async (data: UpdateDepartmentInput): Promise<Department> => {
    const response = await apiClient.put<ApiResponse<Department>>(`/departments/${data.id}`, data);
    return response.data.data;
};

const deleteDepartment = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/departments/${id}`);
    return response.data.data;
};

// Hook to fetch all Departments and update the store
export const useDepartments = () => {
    const setDepartments = useDepartmentStore((state) => state.setDepartments);
    const query = useQuery({
        queryKey: ["departments"],
        queryFn: fetchDepartments,
    });

    useEffect(() => {
        if (query.data) {
            setDepartments(query.data);
        }
    }, [query.data, setDepartments]);

    return query;
};

// Hook to fetch a single Department by ID
export const useDepartment = (id: string) => {
    return useQuery<Department | null, Error>({
        queryKey: ["department", id],
        queryFn: () => fetchDepartmentById(id),
        enabled: !!id,
    });
};

// Hook to create a new Department and update the store
export const useCreateDepartment = (onSuccessCallback?: (department: Department) => void) => {
    const queryClient = useQueryClient();
    const addDepartment = useDepartmentStore((state) => state.addDepartment);
    return useMutation({
        mutationFn: createDepartment,
        onSuccess: (department) => {
            toast.success("Department created successfully!");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            addDepartment(department);
            if (onSuccessCallback) onSuccessCallback(department);
        },
        onError: () => {
            toast.error("Failed to create department");
        },
    });
};

// Hook to update a Department and update the store
export const useUpdateDepartment = () => {
    const queryClient = useQueryClient();
    const updateDepartmentInStore = useDepartmentStore((state) => state.updateDepartment);
    return useMutation({
        mutationFn: updateDepartment,
        onSuccess: (updatedDepartment) => {
            toast.success("Department updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            updateDepartmentInStore(updatedDepartment);
        },
        onError: () => {
            toast.error("Failed to update department");
        },
    });
};

// Hook to delete a Department and update the store
export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    const deleteDepartmentFromStore = useDepartmentStore((state) => state.deleteDepartment);
    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: (_, departmentId) => {
            toast.success("Department deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            deleteDepartmentFromStore(departmentId);
        },
        onError: () => {
            toast.error("Failed to delete department");
        },
    });
};
