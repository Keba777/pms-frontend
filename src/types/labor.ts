export interface Labor {
    id: string;
    activity_id: string;
    requestId: string;

    role: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    estimatedHours: number;
    rate: number;
    totalAmount: number;

    skill_level?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateLaborInput {
    activity_id: string;
    requestId: string;

    role: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    estimatedHours: number;
    rate: number;
    totalAmount: number;

    skill_level?: string;
}

export interface UpdateLaborInput {
    id: string;
    activity_id: string;
    requestId: string;

    role: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    estimatedHours: number;
    rate: number;
    totalAmount: number;

    skill_level?: string;
}