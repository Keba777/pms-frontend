export interface Material {
    id: string;
    quantity: number;
    warehouse_id: string;
    item: string;
    rate_with_vat: number;
    unit: string;
    activity_id: string;
    financial_status?: "Approved" | "Not Approved";
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreateMaterialInput {
    quantity: number;
    warehouse_id: string;
    item: string;
    rate_with_vat: number;
    unit: string;
    activity_id: string;
}
export interface UpdateMaterialInput {
    id: string;
    quantity?: number;
    warehouse_id?: string;
    item?: string;
    rate_with_vat?: number;
    unit?: string;
    activity_id?: string;
    financial_status?: "Approved" | "Not Approved";
}