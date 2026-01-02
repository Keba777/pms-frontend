import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Organization } from "@/types/organization";
import { toast } from "react-toastify";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// API functions
const fetchOrganizations = async (): Promise<Organization[]> => {
    const response = await apiClient.get<ApiResponse<Organization[]>>("/organizations");
    return response.data.data;
};

const fetchOrganizationById = async (id: string): Promise<Organization> => {
    const response = await apiClient.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return response.data.data;
};

const createOrganization = async (data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.post<ApiResponse<Organization>>("/organizations", data);
    return response.data.data;
};

const updateOrganization = async ({ id, data }: { id: string; data: FormData | Partial<Organization> }): Promise<Organization> => {
    // If it's a FormData (for logo/favicon uploads), we send it with proper headers
    if (data instanceof FormData) {
        const response = await apiClient.put<ApiResponse<Organization>>(`/organizations/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    }

    const response = await apiClient.put<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return response.data.data;
};

// React Query Hooks
export const useOrganizations = () => {
    return useQuery({
        queryKey: ["organizations"],
        queryFn: fetchOrganizations,
    });
};

export const useOrganization = (id: string) => {
    return useQuery({
        queryKey: ["organization", id],
        queryFn: () => fetchOrganizationById(id),
        enabled: !!id,
    });
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createOrganization,
        onSuccess: () => {
            toast.success("Organization created successfully!");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create organization");
        },
    });
};

export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrganization,
        onSuccess: (updated) => {
            toast.success("Organization updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
            queryClient.invalidateQueries({ queryKey: ["organization", updated.id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update organization");
        },
    });
};
