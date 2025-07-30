import { Kpi } from "@/types/kpi";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface KPIStore {
    kpis: Kpi[];
    setKPIs: (kpis: Kpi[]) => void;
    addKPI: (kpi: Kpi) => void;
    updateKPI: (updatedKPI: Kpi) => void;
    deleteKPI: (kpiId: string) => void;
}
export const useKPIStore = create<KPIStore>()(
    persist(
        (set) => ({
            kpis: [],
            setKPIs: (kpis) => set({ kpis }),
            addKPI: (kpi) =>
                set((state) => ({
                    kpis: [...state.kpis, kpi],
                })),
            updateKPI: (updatedKPI) =>
                set((state) => ({
                    kpis: state.kpis.map((kpi) =>
                        kpi.id === updatedKPI.id ? updatedKPI : kpi
                    ),
                })),
            deleteKPI: (kpiId) =>
                set((state) => ({
                    kpis: state.kpis.filter((kpi) => kpi.id !== kpiId),
                })),
        }),
        {
            name: "kpi-store",
            storage: {
                getItem: (name: string): StorageValue<KPIStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<KPIStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                }
            } as PersistStorage<KPIStore>,
        }
    )
);