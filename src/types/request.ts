import { Site } from "./site";

export interface Request {
    id: string;
    userId: string;
    departmentId?: string;
    activityId?: string;
    siteId?: string;
    site?: Site;
    materialCount?: number;
    laborCount?: number;
    equipmentCount?: number;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
    laborIds?: string[];
    materialIds?: string[];
    equipmentIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateRequestInput {
    userId: string;
    departmentId?: string;
    activityId?: string;
    siteId?: string;
    materialCount?: number;
    laborCount?: number;
    equipmentCount?: number;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
    laborIds?: string[];
    materialIds?: string[];
    equipmentIds?: string[];
}

export interface UpdateRequestInput {
    id: string;
    userId?: string;
    departmentId?: string;
    activityId?: string;
    siteId?: string;
    materialCount?: number;
    laborCount?: number;
    equipmentCount?: number;
    status?: "Pending" | "In Progress" | "Completed" | "Rejected";
    laborIds?: string[];
    materialIds?: string[];
    equipmentIds?: string[];
}