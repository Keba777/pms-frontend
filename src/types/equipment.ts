import { Site } from "./site";

export interface Equipment {
    id: string;
    item: string;
    siteId: string;
    site?: Site
    type?: string
    unit: string;
    manufacturer?: string;
    model?: string
    year?: string;
    quantity?: number
    minQuantity?: number;
    reorderQuantity?: number;
    outOfStore?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    overTime?: number;
    condition?: string
    owner?: "Raycon" | "Rental"
    status?: "Allocated" | "Unallocated" | "OnMaintainance" | "InActive"
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateEquipmentInput {
    item: string;
    type?: string
    unit: string;
    manufacturer?: string;
    model?: string
    year?: string;
    quantity?: number
    minQuantity?: number;
    reorderQuantity?: number;
    outOfStore?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    overTime?: number;
    condition?: string
    owner?: "Raycon" | "Rental"
    status?: "Allocated" | "Unallocated" | "OnMaintainance" | "InActive"
}

export interface UpdateEquipmentInput {
    id: string;
    item?: string;
    type?: string
    unit?: string;
    manufacturer?: string;
    model?: string
    year?: string;
    quantity?: number
    minQuantity?: number;
    reorderQuantity?: number;
    outOfStore?: number;
    estimatedHours?: number;
    rate?: number;
    totalAmount?: number;
    overTime?: number;
    condition?: string
    owner?: "Raycon" | "Rental"
    status?: "Allocated" | "Unallocated" | "OnMaintainance" | "InActive"
}