import { User } from "./user";

export type NotificationData = Record<string, unknown>;

export interface Notification {
    id?: string;
    type: string;          // e.g. 'task.assigned', 'profile.updated', etc.
    data?: NotificationData;
    read?: boolean;
    user_id: string;
    user?: User;
    createdAt?: string;            // optional timestamp
    updatedAt?: string;
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
}

export interface NotificationPayload {
    type: string;
    data?: NotificationData;
    read?: boolean;
    user_id: string;
    user?: User;
}

export interface NotificationCreatePayload {
    type: string;
    data?: NotificationData;
    user_id: string;
}

export interface NotificationUpdatePayload {
    id: string;
    type?: string;
    data?: NotificationData;
    read?: boolean;
}

