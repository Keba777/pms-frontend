export interface Material {
    id: string;
    activityId: string;
    requestId: string;
    warehouseId?: string;
    item: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    rate: number;
    totalAmount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreateMaterialInput {
    activityId: string;
    requestId: string;
    warehouseId?: string;
    item: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    rate: number;
    totalAmount: number;
}
export interface UpdateMaterialInput {
    id: string;
    activityId: string;
    requestId: string;
    warehouseId?: string;
    item: string;
    unit: string;
    requestQuantity: number;
    minQuantity: number;
    rate: number;
    totalAmount: number;
}