import { create } from "zustand";
import { ChatRoom } from "@/types/chat";

interface ChatStore {
    rooms: ChatRoom[];
    setRooms: (rooms: ChatRoom[]) => void;
    addRoom: (room: ChatRoom) => void;
    updateRoom: (updatedRoom: ChatRoom) => void;
    deleteRoom: (roomId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
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
}));