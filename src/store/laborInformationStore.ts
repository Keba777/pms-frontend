//store/laborInformationStore.ts
import { LaborInformation } from "@/types/laborInformation";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface LaborInformationStore {
    laborInformations: LaborInformation[];
    setLaborInformations: (laborInformations: LaborInformation[]) => void;
    addLaborInformation: (laborInformation: LaborInformation) => void;
    updateLaborInformation: (updatedLaborInformation: LaborInformation) => void;
    deleteLaborInformation: (laborId: string) => void;
}

export const useLaborInformationStore = create<LaborInformationStore>()(
    persist(
        (set) => ({
            laborInformations: [],
            setLaborInformations: (laborInformations) => set({ laborInformations }),
            addLaborInformation: (laborInformation) =>
                set((state) => ({
                    laborInformations: [...state.laborInformations, laborInformation],
                })),
            updateLaborInformation: (updatedLaborInformation) =>
                set((state) => ({
                    laborInformations: state.laborInformations.map((laborInformation) =>
                        laborInformation.id === updatedLaborInformation.id
                            ? updatedLaborInformation
                            : laborInformation
                    ),
                })),
            deleteLaborInformation: (laborId) =>
                set((state) => ({
                    laborInformations: state.laborInformations.filter(
                        (laborInformation) => laborInformation.id !== laborId
                    ),
                })),
        }),
        {
            name: "labor-information-store",
            storage: {
                getItem: (name: string): StorageValue<LaborInformationStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<LaborInformationStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                }
            } as PersistStorage<LaborInformationStore>,
        }
    )
);