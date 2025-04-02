export interface Department {
    id: string;
    name: string;
    description?: string;
    status?: "Active" | "Inactive" | "Pending";
    subDepartment?: { name: string; description?: string }[] | undefined;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateDepartmentInput {
    name: string;
    description?: string;
    status?: "Active" | "Inactive" | "Pending";
    subDepartment?: {
        name: string;
        description?: string;
    };
}

export interface UpdateDepartmentInput {
    id: string;
    name?: string;
    description?: string;
    status?: "Active" | "Inactive" | "Pending";
    subDepartment?: {
        name: string;
        description?: string;
    };
}