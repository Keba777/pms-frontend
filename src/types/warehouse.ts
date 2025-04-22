export interface Warehouse {
    id: string;
    type: string;
    owner: string;
    workingStatus: 'Operational' | 'Non-Operational';
    currentWorkingSite: string;
    approvedBy?: string;
    remark?: string;
    status: 'Active' | 'Inactive' | 'Under Maintenance';
}

export interface CreateWarehouseInput {
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
    type?: string;
    owner?: string;
    workingStatus?: 'Operational' | 'Non-Operational';
    currentWorkingSite?: string;
    approvedBy?: string;
    remark?: string;
    status?: 'Active' | 'Inactive' | 'Under Maintenance';
}
