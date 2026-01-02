"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { CreateClientData, IClient, UpdateClientData } from "@/types/client";
import { useClientStore } from "@/store/clientStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions
// ----------------------------

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Fetch all clients
const fetchClients = async (): Promise<IClient[]> => {
    const response = await apiClient.get<ApiResponse<IClient[]>>("/clients");
    return response.data.data;
};

// Fetch client by ID
const fetchClientById = async (id: string): Promise<IClient> => {
    try {
        const response = await apiClient.get<ApiResponse<IClient>>(`/clients/${id}`);
        return response.data.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch client");
    }
};

// Create a new client
const createClient = async (data: CreateClientData): Promise<IClient> => {
    const response = await apiClient.post<ApiResponse<IClient>>("/clients", data);
    return response.data.data;
};

// Update an existing client
const updateClient = async (data: UpdateClientData & { id: string }): Promise<IClient> => {
    const { id, ...updateData } = data;
    const response = await apiClient.put<ApiResponse<IClient>>(`/clients/${id}`, updateData);
    return response.data.data;
};

// Delete a client
const deleteClient = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/clients/${id}`);
    return response.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------

import { useSearchStore } from "@/store/searchStore";

// Hook to fetch all clients and update the store
export const useClients = () => {
    const setClients = useClientStore((state) => state.setClients);
    const searchQuery = useSearchStore((s) => s.searchQuery);

    const query = useQuery({
        queryKey: ["clients"],
        queryFn: fetchClients,
        select: (clients) => {
            const filtered = clients.filter((c) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                    c.companyName.toLowerCase().includes(q) ||
                    c.responsiblePerson?.toLowerCase().includes(q) ||
                    c.description?.toLowerCase().includes(q) ||
                    c.status?.toLowerCase().includes(q)
                );
            });
            return filtered;
        }
    });

    useEffect(() => {
        if (query.data) {
            setClients(query.data);
        }
    }, [query.data, setClients]);

    return query;
};

// Hook to fetch a client by ID
export const useClient = (id: string) => {
    const query = useQuery({
        queryKey: ["client", id],
        queryFn: () => fetchClientById(id),
        enabled: !!id,
    });

    return query;
};

// Hook to create a new client
export const useCreateClient = (onSuccess?: (client: IClient) => void) => {
    const queryClient = useQueryClient();
    const addClient = useClientStore((state) => state.addClient);

    return useMutation({
        mutationFn: createClient,
        onSuccess: (client) => {
            toast.success("Client created successfully!");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            addClient(client);
            if (onSuccess) onSuccess(client);
        },
        onError: () => {
            toast.error("Failed to create client");
        },
    });
};

// Hook to update a client
export const useUpdateClient = (onSuccess?: (client: IClient) => void) => {
    const queryClient = useQueryClient();
    const updateClientInStore = useClientStore((state) => state.updateClient);

    return useMutation({
        mutationFn: updateClient,
        onSuccess: (client) => {
            toast.success("Client updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            updateClientInStore(client);
            if (onSuccess) onSuccess(client);
        },
        onError: () => {
            toast.error("Failed to update client");
        },
    });
};

// Hook to delete a client
export const useDeleteClient = () => {
    const queryClient = useQueryClient();
    const deleteClientFromStore = useClientStore((state) => state.deleteClient);

    return useMutation({
        mutationFn: deleteClient,
        onSuccess: (_, variables) => {
            toast.success("Client deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            deleteClientFromStore(variables);
        },
        onError: () => {
            toast.error("Failed to delete client");
        },
    });
};
