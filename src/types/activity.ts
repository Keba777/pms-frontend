import { Equipment } from "./equipment";
import { Labor } from "./labor";
import { Material } from "./material";
import { Request } from "./request";
import { Task } from "./task";
import { User } from "./user";

export interface WorkForceItem {
    man_power: string;
    qty: number;
    rate: number;
    est_hrs: number;
}

export interface MachineryItem {
    equipment: string;
    qty: number;
    rate: number;
    est_hrs: number;
}

export interface MaterialItem {
    material: string;
    qty: number;
    rate: number;
}

export interface Activity {
    id: string;
    activity_name: string;
    description?: string;
    task_id: string;
    task?: Task;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    quantity?: number;
    unit: string;
    start_date: Date;
    end_date: Date;
    progress: number;
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    approvalStatus: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: User[];
    requests?: Request[];
    resource: Material | Equipment | Labor;
    image?: string;
    labor_index_factor?: number;
    labor_utilization_factor?: number;
    labor_working_hours_per_day?: number;
    machinery_index_factor?: number;
    machinery_utilization_factor?: number;
    machinery_working_hours_per_day?: number;
    work_force?: WorkForceItem[];
    machinery_list?: MachineryItem[];
    materials_list?: MaterialItem[];
    checked_by_name?: string;
    checked_by_date?: Date;
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
    image?: string;
    labor_index_factor?: number;
    labor_utilization_factor?: number;
    labor_working_hours_per_day?: number;
    machinery_index_factor?: number;
    machinery_utilization_factor?: number;
    machinery_working_hours_per_day?: number;
    work_force?: WorkForceItem[];
    machinery_list?: MachineryItem[];
    materials_list?: MaterialItem[];
    checked_by_name?: string;
    checked_by_date?: Date;
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
    image?: string;
    labor_index_factor?: number;
    labor_utilization_factor?: number;
    labor_working_hours_per_day?: number;
    machinery_index_factor?: number;
    machinery_utilization_factor?: number;
    machinery_working_hours_per_day?: number;
    work_force?: WorkForceItem[];
    machinery_list?: MachineryItem[];
    materials_list?: MaterialItem[];
    checked_by_name?: string;
    checked_by_date?: Date;
}
