import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Organization } from "@/types/organization";
import apiClient from "@/services/api-client";

interface OrganizationStore {
    organization: Organization | null;
    isLoading: boolean;
    error: string | null;
    fetchOrganization: (id: string) => Promise<void>;
    clearOrganization: () => void;
    setOrganization: (org: Organization) => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
    persist(
        (set) => ({
            organization: null,
            isLoading: false,
            error: null,

            fetchOrganization: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiClient.get(`/organizations/${id}`) as any;
                    const data = response.data;
                    if (data.success) {
                        set({ organization: data.data, isLoading: false });
                        // Update favicon and title
                        if (data.data.favicon) {
                            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
                            if (link) link.href = data.data.favicon;
                        }
                    }
                } catch (err: any) {
                    set({
                        error: err.response?.data?.message || "Failed to fetch organization",
                        isLoading: false
                    });
                }
            },

            clearOrganization: () => set({ organization: null, error: null }),

            setOrganization: (org: Organization) => set({ organization: org })
        }),
        {
            name: "organization-store",
        }
    )
);
