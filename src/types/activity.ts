import { Request } from "./request";
import { Task } from "./task";
import { User } from "./user";

export interface Activity {
    id: string;
    activity_name: string;
    description?: string;
    task_id: string;
    task?: Task;
    priority: "Critical" | "High" | "Medium" | "Low";
    quantity?: number;
    unit: string;
    start_date: Date;
    end_date: Date;
    progress: number;
    status: "Not Started" | "Started" | "InProgress" | "Canceled" | "Onhold" | "Completed";
    approvalStatus: "Approved" | "Not Approved" | "Pending";
    assignedUsers?: User[];
    requests?: Request[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateActivityInput {
    activity_name: string;
    description?: string;
    task_id: string;
    priority: "Critical" | "High" | "Medium" | "Low";
    quantity?: number;
    unit: string;
    start_date: Date;
    end_date: Date;
    progress: number;
    status: "Not Started" | "Started" | "InProgress" | "Canceled" | "Onhold" | "Completed";
    approvalStatus: "Approved" | "Not Approved" | "Pending";
    assignedUsers?: string[];
}

export interface UpdateActivityInput {
    id: string;
    activity_name?: string;
    description?: string;
    task_id?: string;
    priority?: "Critical" | "High" | "Medium" | "Low";
    quantity?: number;
    unit?: string;
    start_date?: Date;
    end_date?: Date;
    progress?: number;
    status?: "Not Started" | "Started" | "InProgress" | "Canceled" | "Onhold" | "Completed";
    approvalStatus?: "Approved" | "Not Approved" | "Pending";
    assignedUsers?: string[];
}
