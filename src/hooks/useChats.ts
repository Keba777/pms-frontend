"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { ChatRoom, ChatMessage, CreateIndividualChatInput, CreateGroupChatInput, UpdateGroupChatInput, AddMembersInput, SendMessageInput } from "@/types/chat";
import { useChatStore } from "@/store/chatStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// 🟡 Fetch All User Chat Rooms
const fetchUserChatRooms = async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get<ApiResponse<ChatRoom[]>>("/chats/chat_rooms");
    return response.data.data;
};

// 🟡 Fetch One Chat Room by ID
export const fetchChatRoomById = async (id: string): Promise<ChatRoom | null> => {
    const response = await apiClient.get<ApiResponse<ChatRoom>>(`/chats/chat_rooms/${id}`);
    return response.data.data;
};

// 🟡 Fetch Chat Messages for a Room
const fetchChatMessages = async (room_id: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ApiResponse<ChatMessage[]>>(`/chats/chat_messages?room_id=${room_id}`);
    return response.data.data;
};

// 🟢 Create Individual Chat Room
const createIndividualChatRoom = async (data: CreateIndividualChatInput): Promise<ChatRoom> => {
    const response = await apiClient.post<ApiResponse<ChatRoom>>("/chats/chat_rooms/individual", data);
    return response.data.data;
};

// 🟢 Create Group Chat Room
const createGroupChatRoom = async (data: CreateGroupChatInput): Promise<ChatRoom> => {
    const response = await apiClient.post<ApiResponse<ChatRoom>>("/chats/chat_rooms/group", data);
    return response.data.data;
};

// 🟠 Update Group Chat Room
const updateGroupChatRoom = async ({ id, ...data }: { id: string } & UpdateGroupChatInput): Promise<ChatRoom> => {
    const response = await apiClient.put<ApiResponse<ChatRoom>>(`/chats/chat_rooms/${id}`, data);
    return response.data.data;
};

// 🔴 Delete Group Chat Room
const deleteGroupChatRoom = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/chats/chat_rooms/${id}`);
    return response.data.data;
};

// 🟢 Add Members to Group
const addMembersToGroup = async ({ id, ...data }: { id: string } & AddMembersInput): Promise<ChatRoom> => {
    const response = await apiClient.post<ApiResponse<ChatRoom>>(`/chats/chat_rooms/${id}/members`, data);
    return response.data.data;
};

// 🔴 Remove Member from Group
const removeMemberFromGroup = async (id: string, userId: string): Promise<ChatRoom> => {
    const response = await apiClient.delete<ApiResponse<ChatRoom>>(`/chats/chat_rooms/${id}/members/${userId}`);
    return response.data.data;
};

// 🟢 Send Chat Message
const sendChatMessage = async (input: SendMessageInput & { file?: Blob }): Promise<ChatMessage> => {
    const { file, ...data } = input;
    if (data.type !== "text" && !file) {
        throw new Error("File required for voice or file type");
    }

    let response;
    if (data.type === "text") {
        response = await apiClient.post<ApiResponse<ChatMessage>>("/chats/chat_messages", data);
    } else {
        const formData = new FormData();
        formData.append("room_id", data.room_id);
        formData.append("type", data.type);
        if (file) {
            const filename = data.type === "voice" ? "voice.m4a" : (file as File).name || "file";
            formData.append("file", file, filename);
        }
        response = await apiClient.post<ApiResponse<ChatMessage>>("/chats/chat_messages", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }
    return response.data.data;
};

// 🔴 Delete Chat Message
const deleteChatMessage = async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/chats/chat_messages/${id}`);
    return response.data.data;
};

// Hook: Get All User Chat Rooms
export const useChatRooms = () => {
    const setRooms = useChatStore((state) => state.setRooms);
    const query = useQuery({
        queryKey: ["chat_rooms"],
        queryFn: fetchUserChatRooms,
    });

    useEffect(() => {
        if (query.data) {
            setRooms(query.data);
        }
    }, [query.data, setRooms]);

    return query;
};

// Hook: Get Chat Room by ID
export const useChatRoom = (id: string) => {
    return useQuery<ChatRoom | null, Error>({
        queryKey: ["chat_room", id],
        queryFn: () => fetchChatRoomById(id),
        enabled: !!id,
    });
};

// Hook: Get Chat Messages for Room
export const useChatMessages = (room_id: string) => {
    return useQuery<ChatMessage[], Error>({
        queryKey: ["chat_messages", room_id],
        queryFn: () => fetchChatMessages(room_id),
        enabled: !!room_id,
    });
};

// ✅ Hook: Create Individual Chat Room
export const useCreateIndividualChatRoom = (onSuccessCallback?: (room: ChatRoom) => void) => {
    const queryClient = useQueryClient();
    const addRoom = useChatStore((state) => state.addRoom);

    return useMutation({
        mutationFn: createIndividualChatRoom,
        onSuccess: (room) => {
            toast.success("Individual chat room created successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_rooms"] });
            addRoom(room);
            if (onSuccessCallback) onSuccessCallback(room);
        },
        onError: () => {
            toast.error("Failed to create individual chat room");
        },
    });
};

// ✅ Hook: Create Group Chat Room
export const useCreateGroupChatRoom = (onSuccessCallback?: (room: ChatRoom) => void) => {
    const queryClient = useQueryClient();
    const addRoom = useChatStore((state) => state.addRoom);

    return useMutation({
        mutationFn: createGroupChatRoom,
        onSuccess: (room) => {
            toast.success("Group chat room created successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_rooms"] });
            addRoom(room);
            if (onSuccessCallback) onSuccessCallback(room);
        },
        onError: () => {
            toast.error("Failed to create group chat room");
        },
    });
};

// ✅ Hook: Update Group Chat Room
export const useUpdateGroupChatRoom = () => {
    const queryClient = useQueryClient();
    const updateRoom = useChatStore((state) => state.updateRoom);

    return useMutation({
        mutationFn: updateGroupChatRoom,
        onSuccess: (updatedRoom) => {
            toast.success("Group chat room updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_rooms"] });
            updateRoom(updatedRoom);
        },
        onError: () => {
            toast.error("Failed to update group chat room");
        },
    });
};

// ✅ Hook: Delete Group Chat Room
export const useDeleteGroupChatRoom = () => {
    const queryClient = useQueryClient();
    const deleteRoom = useChatStore((state) => state.deleteRoom);

    return useMutation({
        mutationFn: deleteGroupChatRoom,
        onSuccess: (_, id) => {
            toast.success("Group chat room deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_rooms"] });
            deleteRoom(id);
        },
        onError: () => {
            toast.error("Failed to delete group chat room");
        },
    });
};

// ✅ Hook: Add Members to Group
export const useAddMembersToGroup = () => {
    const queryClient = useQueryClient();
    const updateRoom = useChatStore((state) => state.updateRoom);

    return useMutation({
        mutationFn: addMembersToGroup,
        onSuccess: (updatedRoom) => {
            toast.success("Members added successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_rooms"] });
            updateRoom(updatedRoom);
        },
        onError: () => {
            toast.error("Failed to add members");
        },
    });
};

// ✅ Hook: Remove Member from Group
export const useRemoveMemberFromGroup = () => {
    const queryClient = useQueryClient();
    const updateRoom = useChatStore((state) => state.updateRoom);

    return useMutation({
        mutationFn: ({ id, userId }: { id: string, userId: string }) => removeMemberFromGroup(id, userId),
        onSuccess: (updatedRoom) => {
            toast.success("Member removed successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_rooms"] });
            updateRoom(updatedRoom);
        },
        onError: () => {
            toast.error("Failed to remove member");
        },
    });
};

// ✅ Hook: Send Chat Message
export const useSendChatMessage = (room_id: string) => {
    const queryClient = useQueryClient();

    return useMutation<ChatMessage, Error, SendMessageInput & { file?: Blob }>({
        mutationFn: sendChatMessage,
        onSuccess: () => {
            toast.success("Message sent successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_messages", room_id] });
        },
        onError: () => {
            toast.error("Failed to send message");
        },
    });
};

// ✅ Hook: Delete Chat Message
export const useDeleteChatMessage = (room_id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteChatMessage,
        onSuccess: (_, id) => {
            toast.success("Message deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["chat_messages", room_id] });
        },
        onError: () => {
            toast.error("Failed to delete message");
        },
    });
};