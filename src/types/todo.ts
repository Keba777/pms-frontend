import { User } from "./user";
import { Kpi } from "./kpi";
import { Department } from "./department";

// =======================
// Todo Interfaces
// =======================
export interface Todo {
    id: string;
    task: string;
    type: string;
    priority: "Urgent" | "High" | "Medium" | "Low";
    assignedById: string;
    assignedBy?: User;
    assignedUsers?: User[];
    givenDate: Date;
    dueDate: Date;
    target_date: Date;
    target: string[];
    kpiId?: string;
    kpi?: Kpi;
    departmentId: string;
    department?: Department;
    status: "Not Started" | "In progress" | "Pending" | "Completed";
    progress: number;
    remark?: string;
    remainder?: string;
    attachment?: string[];
    progressUpdates?: TodoProgress[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateTodoInput {
    task: string;
    type: string;
    priority: "Urgent" | "High" | "Medium" | "Low";
    assignedUsers?: string[];
    dueDate: Date;
    target_date: Date;
    target: string[];
    departmentId: string;
    status?: "Not Started" | "In progress" | "Pending" | "Completed";
    progress?: number;
    remark?: string;
    remainder?: string;
    attachment?: File[];
}

export interface UpdateTodoInput {
    id?: string;
    task?: string;
    type?: string;
    priority?: "Urgent" | "High" | "Medium" | "Low";
    assignedUsers?: string[];
    dueDate?: Date;
    target_date?: Date;
    target?: string[];
    departmentId?: string;
    status?: "Not Started" | "In progress" | "Pending" | "Completed";
    progress?: number;
    remark?: string;
    remainder?: string;
    existingAttachments?: string[];
    attachment?: File[];
}

// =======================
// Todo Progress Interfaces
// =======================
export interface TodoProgress {
    id: string;
    todoId: string;
    progress: number;
    remark?: string;
    attachment?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateTodoProgressInput {
    todoId: string;
    progress: number;
    remark?: string;
    attachment?: File[];
}

export interface UpdateTodoProgressInput {
    id?: string;
    progress?: number;
    remark?: string;
    attachment?: string[];
}
