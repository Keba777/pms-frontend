import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { File } from "@/types/file";

// =======================
// File Store
// =======================
interface FileStore {
    files: File[];
    setFiles: (files: File[]) => void;
    addFile: (file: File) => void;
    updateFile: (updatedFile: File) => void;
    deleteFile: (fileId: string) => void;
}

export const useFileStore = create<FileStore>()(
    persist(
        (set) => ({
            files: [],
            setFiles: (files) => set({ files }),
            addFile: (file) =>
                set((state) => ({ files: [...state.files, file] })),
            updateFile: (updatedFile) =>
                set((state) => ({
                    files: state.files.map((file) =>
                        file.id === updatedFile.id ? updatedFile : file
                    ),
                })),
            deleteFile: (fileId) =>
                set((state) => ({
                    files: state.files.filter((file) => file.id !== fileId),
                })),
        }),
        {
            name: "file-store",
            storage: {
                getItem: (name: string): StorageValue<FileStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<FileStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<FileStore>,
        }
    )
);
