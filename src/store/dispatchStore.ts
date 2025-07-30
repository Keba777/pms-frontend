import { Dispatch } from "@/types/dispatch";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface DispatchStore {
    dispatches: Dispatch[];
    setDispatches: (dispatches: Dispatch[]) => void;
    addDispatch: (dispatch: Dispatch) => void;
    updateDispatch: (updatedDispatch: Dispatch) => void;
    deleteDispatch: (dispatchId: string) => void;
}

export const useDispatchStore = create<DispatchStore>()(
    persist(
        (set) => ({
            dispatches: [],
            setDispatches: (dispatches) => set({ dispatches }),
            addDispatch: (dispatch) =>
                set((state) => ({ dispatches: [...state.dispatches, dispatch] })),
            updateDispatch: (updatedDispatch) =>
                set((state) => ({
                    dispatches: state.dispatches.map((dispatch) =>
                        dispatch.id === updatedDispatch.id ? updatedDispatch : dispatch
                    ),
                })),
            deleteDispatch: (dispatchId) =>
                set((state) => ({
                    dispatches: state.dispatches.filter(
                        (dispatch) => dispatch.id !== dispatchId
                    ),
                })),
        }),
        {
            name: "dispatch-store",
            storage: {
                getItem: (name: string): StorageValue<DispatchStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<DispatchStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<DispatchStore>,
        }
    )
);