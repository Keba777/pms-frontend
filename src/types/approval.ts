export interface Approval {
    id: string;
    requestId: string;
    departmentId: string;
    stepOrder: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: string;
    approvedAt?: Date;
    remarks?: string;
}

export interface CreateApprovalInput {
    requestId: string;
    departmentId: string;
    stepOrder: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: string;
    approvedAt?: Date;
    remarks?: string;
}

export interface UpdateApprovalInput {
    id: string;
    requestId: string;
    departmentId: string;
    stepOrder: number;
    status: "Pending" | "Approved" | "Rejected";
    approvedBy?: string;
    approvedAt?: Date;
    remarks?: string;
}