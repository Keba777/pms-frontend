
export interface Equipment {
    id: string;
    item: string;
    rate_with_vat: number;
    reorder_quantity: number;
    min_quantity: number;
    manufacturer?: string;
    year?: number;
    eqp_condition?: string;
    activity_id: string;
    financial_status?: "Approved" | "Not Approved";
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateEquipmentInput {
    item: string;
    rate_with_vat: number;
    reorder_quantity: number;
    min_quantity: number;
    manufacturer?: string;
    year?: number;
    eqp_condition?: string;
    activity_id: string;
}

export interface UpdateEquipmentInput {
    id: string;
    item?: string;
    rate_with_vat?: number;
    reorder_quantity?: number;
    min_quantity?: number;
    manufacturer?: string;
    year?: number;
    eqp_condition?: string;
    activity_id?: string;
    financial_status?: "Approved" | "Not Approved";
}