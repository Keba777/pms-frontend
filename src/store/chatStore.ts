import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { ChatRoom } from "@/types/chat";

interface ChatStore {
    rooms: ChatRoom[];
    setRooms: (rooms: ChatRoom[]) => void;
    addRoom: (room: ChatRoom) => void;
    updateRoom: (updatedRoom: ChatRoom) => void;
    deleteRoom: (roomId: string) => void;
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set) => ({
            rooms: [],
            setRooms: (rooms) => set({ rooms }),
            addRoom: (room) =>
                set((state) => ({ rooms: [...state.rooms, room] })),
            updateRoom: (updatedRoom) =>
                set((state) => ({
                    rooms: state.rooms.map((room) =>
                        room.id === updatedRoom.id ? updatedRoom : room
                    ),
                })),
            deleteRoom: (roomId) =>
                set((state) => ({
                    rooms: state.rooms.filter(
                        (room) => room.id !== roomId
                    ),
                })),
        }),
        {
            name: "chat-store",
            storage: {
                getItem: (name: string): StorageValue<ChatStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<ChatStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<ChatStore>,
        }
    )
);