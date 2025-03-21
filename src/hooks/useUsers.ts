import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { User } from "@/types/user";
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

// Fetch user details by ID
const fetchUserById = async (id: string): Promise<User | null> => {
    try {
        const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data;
    } catch (error) {
        throw new Error("Failed to fetch user");
    }
};

// Create a new user
const createUser = async (data: Omit<User, "id">): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>("/users", data);
    return response.data.data;
};

// Update an existing user
const updateUser = async (data: User): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${data.id}`, data);
    return response.data.data;
};

// ----------------------------
// Updated React Query hooks
// ----------------------------

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

// Hook to create a new user and update the store
export const useCreateUser = (onSuccess?: (user: User) => void) => {
    const queryClient = useQueryClient();
    const setUser = useUserStore((state) => state.setUser);

    return useMutation({
        mutationFn: createUser,
        onSuccess: (user) => {
            toast.success("User created successfully!");
            queryClient.invalidateQueries({ queryKey: ["user"] });
            setUser(user);
            if (onSuccess) onSuccess(user);
        },
        onError: () => {
            toast.error("Failed to create user");
        },
    });
};

// Hook to update an existing user and update the store
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const updateUserInStore = useUserStore((state) => state.updateUser);

    return useMutation({
        mutationFn: updateUser,
        onSuccess: (updatedUser) => {
            toast.success("User updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["user"] });
            updateUserInStore(updatedUser);
        },
        onError: () => {
            toast.error("Failed to update user");
        },
    });
};
