export interface Material {
    id: string;
    warehouseId?: string;
    item: string;
    type?: string
    unit: string;
    quantity?: number;
    minQuantity?: number;
    reorderQuantity?: number;
    outOfStore?: number;
    rate?: number;
    shelfNo?: string;
    status?: "Available" | "Unavailable";
    totalPrice?: number;
}
export interface CreateMaterialInput {
    warehouseId?: string;
    item: string;
    type?: string
    unit: string;
    quantity?: number;
    minQuantity?: number;
    reorderQuantity?: number;
    outOfStore?: number;
    rate?: number;
    shelfNo?: string;
    status?: "Available" | "Unavailable";
}
export interface UpdateMaterialInput {
    id?: string;
    warehouseId?: string;
    item?: string;
    type?: string
    unit?: string;
    quantity?: number;
    minQuantity?: number;
    reorderQuantity?: number;
    outOfStore?: number;
    rate?: number;
    shelfNo?: string;
    status?: "Available" | "Unavailable";
}