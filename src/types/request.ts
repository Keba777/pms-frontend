export interface Request {
    id: string;
    userId: string;
    departmentId?: string;
    activityId?: string;
    materialCount?: number;
    laborCount?: number;
    equipmentCount?: number;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
    laborIds?: string[];
    materialIds?: string[];
    equipmentIds?: string[]; 
}

export interface CreateRequestInput {
    userId: string;
    departmentId?: string;
    activityId?: string;
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
    materialCount?: number;
    laborCount?: number;
    equipmentCount?: number;
    status?: "Pending" | "In Progress" | "Completed" | "Rejected";
    laborIds?: string[];
    materialIds?: string[];
    equipmentIds?: string[];
}