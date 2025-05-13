export interface Warehouse {
    id: string;
    type: string;
    siteId?: string;
    owner: string;
    workingStatus: 'Operational' | 'Non-Operational';
    approvedBy?: string;
    remark?: string;
    status: 'Active' | 'Inactive' | 'Under Maintenance';
}

export interface CreateWarehouseInput {
    type: string;
    siteId: string;
    owner: string;
    workingStatus: 'Operational' | 'Non-Operational';
    approvedBy?: string;
    remark?: string;
    status: 'Active' | 'Inactive' | 'Under Maintenance';
}

export interface UpdateWarehouseInput {
    id: string;
    type?: string;
    siteId?: string;
    owner?: string;
    workingStatus?: 'Operational' | 'Non-Operational';
    approvedBy?: string;
    remark?: string;
    status?: 'Active' | 'Inactive' | 'Under Maintenance';
}
