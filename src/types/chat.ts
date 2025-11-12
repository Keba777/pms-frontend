import { User } from "./user";

export interface ChatRoom {
    id: string;
    name?: string;
    is_group: boolean;
    owner_id?: string;
    owner?: User;
    members?: User[];
    messages?: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    id: string;
    room_id: string;
    sender_id: string;
    sender?: User;
    type: "text" | "voice" | "file";
    content?: string;
    media_url?: string;
    filename?: string;
    mime_type?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateIndividualChatInput {
    otherUserId: string;
}

export interface CreateGroupChatInput {
    name: string;
    memberIds: string[];
}

export interface UpdateGroupChatInput {
    name: string;
}

export interface AddMembersInput {
    memberIds: string[];
}

export interface SendMessageInput {
    room_id: string;
    type: "text" | "voice" | "file";
    content?: string;
}