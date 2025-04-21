export interface Request {
    id: string;
    reqNumber: string;
    date: Date;
    userId: string;
    departmentId: string;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
}

export interface CreateRequestInput {
    reqNumber: string;
    date: Date;
    userId: string;
    departmentId: string;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
}

export interface UpdateRequestInput {
    id: string;
    reqNumber: string;
    date: Date;
    userId: string;
    departmentId: string;
    status: "Pending" | "In Progress" | "Completed" | "Rejected";
}