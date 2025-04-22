export interface Labor {
    id: string;
    role: string;
    unit: string;
    minQuantity?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    skill_level?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateLaborInput {
    role: string;
    unit: string;
    minQuantity?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    skill_level?: string;
}

export interface UpdateLaborInput {
    id: string;
    role?: string;
    unit?: string;
    minQuantity?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    skill_level?: string;
}