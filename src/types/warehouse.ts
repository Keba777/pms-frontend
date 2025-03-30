export interface Warehouse {
    id: string;
    equipment_id: string;
    type: string;
    owner: string;
    workingStatus: 'Operational' | 'Non-Operational';
    currentWorkingSite: string;
    approvedBy?: string;
    remark?: string;
    status: 'Active' | 'Inactive' | 'Under Maintenance';
}
export interface CreateWarehouseInput {
    equipment_id: string;
    type: string;
    owner: string;
    workingStatus: 'Operational' | 'Non-Operational';
    currentWorkingSite: string;
    approvedBy?: string;
    remark?: string;
    status: 'Active' | 'Inactive' | 'Under Maintenance';
}
export interface UpdateWarehouseInput {
    id: string;
    equipment_id?: string;
    type?: string;
    owner?: string;
    workingStatus?: 'Operational' | 'Non-Operational';
    currentWorkingSite?: string;
    approvedBy?: string;
    remark?: string;
    status?: 'Active' | 'Inactive' | 'Under Maintenance';
}
