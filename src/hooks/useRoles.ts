import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Role, CreateRoleInput, UpdateRoleInput } from "@/types/user";
import { useRoleStore } from "@/store/roleStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions
// ----------------------------

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchRoles = async (): Promise<Role[]> => {
    try {
        const response = await apiClient.get<ApiResponse<Role[]>>("/roles");
        return response.data.data;
    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch roles");
    }
};

const fetchRoleById = async (id: string): Promise<Role | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching role:", error);
        return null;
    }
};

const createRole = async (data: CreateRoleInput): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>("/roles", data);
    return response.data.data;
};

const updateRole = async (data: UpdateRoleInput): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/roles/${data.id}`, data);
    return response.data.data;
};

const deleteRole = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/roles/${id}`);
    return response.data.data;
};

// ----------------------------
// Updated React Query hooks
// ----------------------------

import { useSearchStore } from "@/store/searchStore";

// Hook to fetch all Roles and update the store
export const useRoles = () => {
    const setRoles = useRoleStore((state) => state.setRoles);
    const searchQuery = useSearchStore((s) => s.searchQuery);

    const query = useQuery({
        queryKey: ["roles"],
        queryFn: fetchRoles,
        select: (roles) => {
            const filtered = roles.filter((r) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return r.name.toLowerCase().includes(q);
            });
            return filtered;
        }
    });

    useEffect(() => {
        if (query.data) {
            setRoles(query.data);
        }
    }, [query.data, setRoles]);

    return query;
};

// Hook to fetch a single Role by ID
export const useRole = (id: string) => {
    return useQuery<Role | null, Error>({
        queryKey: ["role", id],
        queryFn: () => fetchRoleById(id),
        enabled: !!id,
    });
};

// Hook to create a new role and update the store
export const useCreateRole = (onSuccess?: (role: Role) => void) => {
    const queryClient = useQueryClient();
    const addRole = useRoleStore((state) => state.addRole);
    return useMutation({
        mutationFn: createRole,
        onSuccess: (role) => {
            toast.success("Role created successfully!");
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            addRole(role);
            if (onSuccess) onSuccess(role); // Call the onSuccess callback if provided
        },
        onError: () => {
            toast.error("Failed to create role");
        },
    });
};

// Hook to update a role and update the store
export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    const updateRoleInStore = useRoleStore((state) => state.updateRole);
    return useMutation({
        mutationFn: updateRole,
        onSuccess: (updatedRole) => {
            toast.success("Role updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            updateRoleInStore(updatedRole);
        },
        onError: () => {
            toast.error("Failed to update role");
        },
    });
};

// Hook to delete a role and update the store
export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    const deleteRoleFromStore = useRoleStore((state) => state.deleteRole);
    return useMutation({
        mutationFn: deleteRole,
        onSuccess: (_, variables) => {
            toast.success("Role deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            // variables is the role id in our deleteRole function
            deleteRoleFromStore(variables);
        },
        onError: () => {
            toast.error("Failed to delete role");
        },
    });
};
