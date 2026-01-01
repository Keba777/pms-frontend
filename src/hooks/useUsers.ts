"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { UpdateUserInput, User } from "@/types/user";
import { useUserStore } from "@/store/userStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions
// ----------------------------

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Fetch all users
const fetchUsers = async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>("/users");
    return response.data.data;
};

// Fetch user details by ID
const fetchUserById = async (id: string): Promise<User | null> => {
    try {
        const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch user");
    }
};

// Create a new user
// Create a new user (supports FormData or JSON)
const createUser = async (data: Omit<User, "id"> | FormData): Promise<User> => {
    // If it's already FormData, just send it
    if (data instanceof FormData) {
        const response = await apiClient.post<ApiResponse<User>>("/users", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
    }

    // Otherwise treat as JSON (unless we want to force FormData conversion here too? 
    // Usually easier to construct FormData in the component if we have files, 
    // OR we helper here. Let's assume component sends FormData if file exists, 
    // or we can handle mixed object here.
    // Given the types, let's keep it simple: if Component sends object with file, we convert?
    // But Omit<User, "id"> doesn't easily describe a File object property in "profile_picture" 
    // because User type says string.
    // The component usually has a local type like CreateUserInput which has profile_picture?: string | File.
    // Let's accept any/generic for flexibility or update types properly.

    // For now, let's allow the caller to pass FormData.
    const response = await apiClient.post<ApiResponse<User>>("/users", data);
    return response.data.data;
};

// Import multiple users
const importUsers = async (formData: FormData): Promise<User[]> => {
    const response = await apiClient.post<ApiResponse<User[]>>("/users/import", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data.data;
};

// Update an existing user
const updateUser = async (data: UpdateUserInput): Promise<User> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value == null) return;

        if (key === "password" && value === "") return;

        if (key === "profile_picture" && value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
        } else {
            formData.append(key, String(value));
        }
    });

    const response = await apiClient.put<{ success: boolean; data: User }>(
        `/users/${data.id}`, formData);

    return response.data.data;
};

// Delete a user
const deleteUser = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/users/${id}`);
    return response.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------

// Hook to fetch all users and update the store
export const useUsers = () => {
    const setUsers = useUserStore((state) => state.setUsers);

    const query = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });

    useEffect(() => {
        if (query.data) {
            setUsers(query.data);
        }
    }, [query.data, setUsers]);

    return query;
};

// Hook to fetch a user by ID and update the store
export const useUser = (id: string) => {
    const setUser = useUserStore((state) => state.setUser);
    const query = useQuery({
        queryKey: ["user", id],
        queryFn: () => fetchUserById(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (query.data) {
            setUser(query.data); // Update Zustand store with the fetched user
        }
    }, [query.data, setUser]);

    return query;
};

// Hook to create a new user and refresh users list
export const useCreateUser = (onSuccess?: (user: User) => void) => {
    const queryClient = useQueryClient();
    const setUser = useUserStore((state) => state.setUser);

    return useMutation({
        mutationFn: createUser,
        onSuccess: (user) => {
            toast.success("User created successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] }); // Refetch users
            setUser(user);
            if (onSuccess) onSuccess(user);
        },
        onError: () => {
            toast.error("Failed to create user");
        },
    });
};

// Hook to import multiple users and refresh users list
export const useImportUsers = (onSuccess?: (users: User[]) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: importUsers,
        onSuccess: (users) => {
            toast.success("Users imported successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            if (onSuccess) onSuccess(users);
        },
        onError: () => {
            toast.error("Failed to import users");
        },
    });
};

// Hook to update an existing user and refresh users list
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const updateUserInStore = useUserStore((s) => s.updateUser);

    return useMutation<User, unknown, UpdateUserInput>({
        mutationFn: updateUser,
        onSuccess: (updated) => {
            toast.success("User updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            updateUserInStore(updated);
        },
        onError: () => {
            toast.error("Failed to update user");
        },
    });
};

// Hook to delete a user and refresh users list
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const deleteUserFromStore = useUserStore((state) => state.deleteUser);

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (_, variables) => {
            toast.success("User deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            deleteUserFromStore(variables);
        },
        onError: () => {
            toast.error("Failed to delete user");
        }
    });
}
