import { User } from "./user";

// =======================
// File Interfaces
// =======================
export interface File {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    type: "project" | "task" | "activity" | "todo";
    referenceId: string;
    uploadedBy: string;
    uploadedByUser?: User;
    sendTo: string;
    sendToUser?: User;
    date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateFileInput {
    title: string;
    sendTo: string;
    type: "project" | "task" | "activity" | "todo";
    referenceId: string;
    files: globalThis.File[];
}

export interface UpdateFileInput {
    id: string;
    title?: string;
    sendTo?: string;
}
