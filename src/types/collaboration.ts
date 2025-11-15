// src/types/discussion.ts
import { User } from "./user";

export interface AppDiscussion {
  id: number | string;
  subject: string;
  body: string;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  createdBy: string;
  createdByUser?: User;
  isPrivate?: boolean;
  participants?: string[];
  lastMessageAt?: string | Date | null;
  pinned?: boolean;
  date?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateDiscussionInput {
  subject: string;
  body: string;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  isPrivate?: boolean;
  participants?: string[]; // user ids
}

export interface UpdateDiscussionInput {
  id: number | string;
  subject?: string;
  body?: string;
  isPrivate?: boolean;
  participants?: string[];
  lastMessageAt?: string | Date | null;
  pinned?: boolean;
}

// =======================
// Notification Interfaces
// =======================
export interface AppNotification {
  id: number | string;
  title?: string;
  message: string;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  recipient: string;
  recipientUser?: User;
  sender?: string | null;
  senderUser?: User;
  read?: boolean;
  meta?: any;
  date?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateNotificationInput {
  title?: string;
  message: string;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  recipient: string;
  sender?: string;
  meta?: any;
}

export interface UpdateNotificationInput {
  id: number | string;
  title?: string;
  message?: string;
  read?: boolean;
  meta?: any;
}

// =======================
// Activity Interfaces
// =======================
export interface AppActivity {
  id: number | string;
  action: string; // "created", "updated", "deleted", "commented", etc.
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  actor?: string | null;
  actorUser?: User;
  details?: any;
  parentActivityId?: number | string | null;
  date?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateActivityInput {
  action: string;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  actor?: string;
  details?: any;
  parentActivityId?: number | string | null;
}

export interface UpdateActivityInput {
  id: number | string;
  action?: string;
  details?: any;
  parentActivityId?: number | string | null;
}
