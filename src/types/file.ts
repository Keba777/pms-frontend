import { User } from "./user";

// =======================
// File Interfaces
// =======================
export interface AppFile {
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
  date: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateFileInput {
  title: string;
  sendTo: string;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
  files: File[]; // native browser File
}

export interface UpdateFileInput {
  id: string;
  title?: string;
  sendTo?: string;
}
