import { Activity } from "./activity";
import { Approval } from "./approval";
import { Department } from "./department";
import { Site } from "./site";
import { User } from "./user";

export interface Request {
    id: string;
    userId: string;
    user: User;
    departmentId?: string;
    department?: Department
    activityId?: string;
    activity?: Activity;
    siteId?: string;
    site?: Site;
    materialCount?: number;
    laborCount?: number;
    equipmentCount?: number;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
    laborIds?: string[];
    materialIds?: string[];
    equipmentIds?: string[];
    approvals?: Approval[];
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