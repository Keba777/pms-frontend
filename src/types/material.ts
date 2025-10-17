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
    status: "Available" | "Unavailable";
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

export interface LooseMaterialInput {
    item?: string;
    type?: string;
    unit?: string;
    quantity?: string;
    minQuantity?: string;
    rate?: string;
    reorderQuantity?: string;
    shelfNo?: string;
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