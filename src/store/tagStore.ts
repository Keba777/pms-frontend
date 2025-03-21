import { Tag } from "@/types/tag";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

interface TagStore {
    tags: Tag[];
    setTags: (tags: Tag[]) => void;
    addTag: (tag: Tag) => void;
    updateTag: (updatedTag: Tag) => void;
    deleteTag: (tagId: string) => void;
}

export const useTagStore = create<TagStore>()(
    persist(
        (set) => ({
            tags: [],
            setTags: (tags) => set({ tags }),
            addTag: (tag) =>
                set((state) => ({ tags: [...state.tags, tag] })),
            updateTag: (updatedTag) =>
                set((state) => ({
                    tags: state.tags.map((tag) =>
                        tag.id === updatedTag.id ? updatedTag : tag
                    ),
                })),
            deleteTag: (tagId) =>
                set((state) => ({
                    tags: state.tags.filter((tag) => tag.id !== tagId),
                })),
        }),
        {
            name: "tag-store",
            storage: {
                getItem: (name: string): StorageValue<TagStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<TagStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<TagStore>,
        }
    )
);
