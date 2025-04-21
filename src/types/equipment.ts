
export interface Equipment {
    id: string;
    activityId: string;
    requestId: string;

    item: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    estimatedHours: number;
    rate: number;
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateEquipmentInput {
    activityId: string;
    requestId: string;

    item: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    estimatedHours: number;
    rate: number;
    totalAmount: number;
}

export interface UpdateEquipmentInput {
    id: string;
    activityId: string;
    requestId: string;

    item: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    estimatedHours: number;
    rate: number;
    totalAmount: number;
}