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
const createUser = async (data: Omit<User, "id">): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>("/users", data);
    return response.data.data;
};

// Update an existing user
const updateUser = async (data: UpdateUserInput): Promise<User> => {
    const formData = new FormData();

    // Append all fields (skip undefined)
    Object.entries(data).forEach(([key, value]) => {
        if (value == null) return;

        if (key === "profile_picture" && value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            // e.g. responsiblities[]
            value.forEach((item) => formData.append(`${key}[]`, item));
        } else {
            formData.append(key, String(value));
        }
    });

    const response = await apiClient.put<ApiResponse<User>>(
        `/users/${data.id}`,
        formData,
        {
            headers: {
                // Let axios set the correct boundary
                "Content-Type": "multipart/form-data",
            },
        }
    );

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

// Hook to update an existing user and refresh users list
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const updateUserInStore = useUserStore((state) => state.updateUser);

    return useMutation<User, unknown, UpdateUserInput>({
        mutationFn: updateUser,
        onSuccess: (updatedUser) => {
            toast.success("User updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            updateUserInStore(updatedUser);
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
