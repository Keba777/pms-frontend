import { Department } from "./department";
import { Request } from "./request";
import { User } from "./user";

export interface Approval {
    id: string;
    requestId: string;
    request: Request
    departmentId: string;
    department?: Department;
    stepOrder: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: string;
    approvedByUser?: User;
    approvedAt?: Date;
    checkedBy?: string
    checkedByUser?: User;
    remarks?: string;
    prevDepartmentId?: string;
    prevDepartment?: Department;
    nextDepartmentId?: string;
    nextDepartment?: Department;
    finalDepartment?: boolean;
}

export interface CreateApprovalInput {
    requestId: string;
    departmentId: string;
    stepOrder: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: string;
    approvedAt?: Date;
    checkedBy?: string
    remarks?: string;
    prevDepartmentId?: string;
    nextDepartmentId?: string;
    finalDepartment?: boolean;
}

export interface UpdateApprovalInput {
    id: string;
    requestId?: string;
    departmentId?: string;
    stepOrder?: number;
    status?: "Pending" | "Approved" | "Rejected";
    approvedBy?: string;
    approvedAt?: Date;
    checkedBy?: string
    remarks?: string;
    prevDepartmentId?: string;
    nextDepartmentId?: string;
    finalDepartment?: boolean;
}