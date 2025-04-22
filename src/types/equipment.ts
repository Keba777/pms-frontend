export interface Equipment {
    id: string;
    item: string;
    unit: string;
    manufacturer?: string;
    year?: string;
    minQuantity?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateEquipmentInput {
    item: string;
    unit: string;
    manufacturer?: string;
    year?: string;
    minQuantity?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
}

export interface UpdateEquipmentInput {
    id: string;
    item?: string;
    unit?: string;
    manufacturer?: string;
    year?: string;
    minQuantity?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
}