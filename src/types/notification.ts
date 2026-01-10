import { User } from "./user";

export type NotificationData = Record<string, unknown>;

export interface Notification {
    id?: string;
    type: string;          // e.g. 'task.assigned', 'profile.updated', etc.
    title?: string;        // Display title for the notification
    message?: string;      // Detailed message
    data?: NotificationData;
    read?: boolean;
    user_id: string;
    user?: User;
    actionUrl?: string;    // URL to navigate when clicked
    actionLabel?: string;  // Label for action button (e.g., "View Task")
    icon?: string;         // Icon identifier for notification type
    priority?: 'low' | 'medium' | 'high';  // Priority level
    createdAt?: string;    // optional timestamp
    updatedAt?: string;
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
}

export interface NotificationPayload {
    type: string;
    title?: string;
    message?: string;
    data?: NotificationData;
    read?: boolean;
    user_id: string;
    user?: User;
    actionUrl?: string;
    actionLabel?: string;
    icon?: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface NotificationCreatePayload {
    type: string;
    title?: string;
    message?: string;
    data?: NotificationData;
    user_id: string;
    actionUrl?: string;
    actionLabel?: string;
    icon?: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface NotificationUpdatePayload {
    id: string;
    type?: string;
    title?: string;
    message?: string;
    data?: NotificationData;
    read?: boolean;
    actionUrl?: string;
    actionLabel?: string;
    icon?: string;
    priority?: 'low' | 'medium' | 'high';
}

