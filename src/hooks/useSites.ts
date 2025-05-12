import apiClient from "@/services/api-client";
import { useSiteStore } from "@/store/siteStore";
import { Site } from "@/types/site";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// API functions for Sites
const fetchSites = async (): Promise<Site[]> => {
    try {
        const response = await apiClient.get<ApiResponse<Site[]>>("/sites");
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch sites", error);
        throw new Error("Failed to fetch sites");
    }
};

const fetchSiteById = async (id: string): Promise<Site | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Site>>(`/sites/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching site ${id}:`, error);
        return null;
    }
};

const createSite = async (data: Site): Promise<Site> => {
    const response = await apiClient.post<ApiResponse<Site>>("/sites", data);
    return response.data.data;
};

const updateSite = async (data: Site): Promise<Site> => {
    const response = await apiClient.put<ApiResponse<Site>>(
        `/sites/${data.id}`,
        data
    );
    return response.data.data;
};

const deleteSite = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/sites/${id}`
    );
    return response.data.data;
};

// Hook to fetch all sites and update the store
export const useSites = () => {
    const setSites = useSiteStore((state) => state.setSites);
    const query = useQuery({
        queryKey: ["sites"],
        queryFn: fetchSites,
    });

    useEffect(() => {
        if (query.data) setSites(query.data);
    }, [query.data, setSites]);

    return query;
};

// Hook to fetch a single site by ID
export const useSite = (id: string) => {
    return useQuery<Site | null, Error>({
        queryKey: ["site", id],
        queryFn: () => fetchSiteById(id),
        enabled: !!id,
    });
};

// Hook to create a new site and update the store
export const useCreateSite = (onSuccess?: (site: Site) => void) => {
    const queryClient = useQueryClient();
    const addSite = useSiteStore((state) => state.addSite);

    return useMutation({
        mutationFn: createSite,
        onSuccess: (site) => {
            toast.success("Site created successfully!");
            queryClient.invalidateQueries({ queryKey: ["sites"] });
            addSite(site);
            if (onSuccess) onSuccess(site);
        },
        onError: () => {
            toast.error("Failed to create site");
        },
    });
};

// Hook to update a site and update the store
export const useUpdateSite = () => {
    const queryClient = useQueryClient();
    const updateSiteInStore = useSiteStore((state) => state.updateSite);

    return useMutation({
        mutationFn: updateSite,
        onSuccess: (updatedSite) => {
            toast.success("Site updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["sites"] });
            updateSiteInStore(updatedSite);
        },
        onError: () => {
            toast.error("Failed to update site");
        },
    });
};

// Hook to delete a site and update the store
export const useDeleteSite = () => {
    const queryClient = useQueryClient();
    const deleteSiteFromStore = useSiteStore((state) => state.deleteSite);

    return useMutation({
        mutationFn: deleteSite,
        onSuccess: (_, id) => {
            toast.success("Site deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["sites"] });
            deleteSiteFromStore(id);
        },
        onError: () => {
            toast.error("Failed to delete site");
        },
    });
};
