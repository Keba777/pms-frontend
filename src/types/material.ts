export interface Material {
    id: string;
    warehouseId?: string;
    item: string;
    unit: string;
    minQuantity?: number;
    rate?: number;
    totalAmount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreateMaterialInput {
    warehouseId?: string;
    item: string;
    unit: string;
    minQuantity?: number;
    rate?: number;
    totalAmount?: number;
}
export interface UpdateMaterialInput {
    id: string;
    warehouseId?: string;
    item?: string;
    unit?: string;
    minQuantity?: number;
    rate?: number;
    totalAmount?: number;
}