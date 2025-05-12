// store/siteStore.ts
import { Site } from "@/types/site";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface SiteStore {
    sites: Site[];
    setSites: (sites: Site[]) => void;
    addSite: (site: Site) => void;
    updateSite: (updatedSite: Site) => void;
    deleteSite: (siteId: string) => void;
}

export const useSiteStore = create<SiteStore>()(
    persist(
        (set) => ({
            sites: [],
            setSites: (sites) => set({ sites }),
            addSite: (site) =>
                set((state) => ({ sites: [...state.sites, site] })),
            updateSite: (updatedSite) =>
                set((state) => ({
                    sites: state.sites.map((site) =>
                        site.id === updatedSite.id ? updatedSite : site
                    ),
                })),
            deleteSite: (siteId) =>
                set((state) => ({
                    sites: state.sites.filter((site) => site.id !== siteId),
                })),
        }),
        {
            name: "site-store",
            storage: {
                getItem: (name: string): StorageValue<SiteStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<SiteStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<SiteStore>,
        }
    )
);
