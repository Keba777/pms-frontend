enum TimeSheetStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
}

export interface LaborTimesheet {
    id: string;
    userId: string;
    date: Date;
    morningIn: string;
    morningOut: string;
    mornHrs: number;
    bt: number;
    afternoonIn: string;
    afternoonOut: string;
    aftHrs: number;
    ot: number;
    dt: number;
    rate: number;
    totalPay: number;
    status: TimeSheetStatus;
}

export interface createLaborTimesheetInput {
    userId: string;
    date: Date;
    morningIn: string;
    morningOut: string;
    mornHrs: number;
    bt: number;
    afternoonIn: string;
    afternoonOut: string;
    aftHrs: number;
    ot: number;
    dt: number;
    rate: number;
    totalPay: number;
    status: TimeSheetStatus;
}

export interface updateLaborTimesheetInput {
    id?: string;
    userId?: string;
    date?: Date;
    morningIn?: string;
    morningOut?: string;
    mornHrs?: number;
    bt?: number;
    afternoonIn?: string;
    afternoonOut?: string;
    aftHrs?: number;
    ot?: number;
    dt?: number;
    rate?: number;
    totalPay?: number;
    status?: TimeSheetStatus;
}

export interface EquipmentTimesheet {
    id: string;
    equipmentId: string;
    date: Date;
    morningIn: string;
    morningOut: string;
    mornHrs: number;
    bt: number;
    afternoonIn: string;
    afternoonOut: string;
    aftHrs: number;
    ot: number;
    dt: number;
    rate: number;
    totalPay: number;
    status: TimeSheetStatus;
}

export interface createEquipmentTimesheetInput {
    equipmentId: string;
    date: Date;
    morningIn: string;
    morningOut: string;
    mornHrs: number;
    bt: number;
    afternoonIn: string;
    afternoonOut: string;
    aftHrs: number;
    ot: number;
    dt: number;
    rate: number;
    totalPay: number;
    status: TimeSheetStatus;
}

export interface updateEquipmentTimesheetInput {
    id?: string;
    equipmentId?: string;
    date?: Date;
    morningIn?: string;
    morningOut?: string;
    mornHrs?: number;
    bt?: number;
    afternoonIn?: string;
    afternoonOut?: string;
    aftHrs?: number;
    ot?: number;
    dt?: number;
    rate?: number;
    totalPay?: number;
    status?: TimeSheetStatus;
}

export interface MaterialBalanceSheet {
    id: string;
    materialId: string;
    date: Date;
    receivedQty: number;
    utilizedQty: number;
    balance: number;
    assignedTo: string;
    remark?: string;
    status: string;
}

export interface createMaterialBalanceSheetInput {
    materialId: string;
    date: Date;
    receivedQty: number;
    utilizedQty: number;
    balance: number;
    assignedTo: string;
    remark?: string;
    status: string;
}

export interface updateMaterialBalanceSheetInput {
    id?: string;
    materialId?: string;
    date?: Date;
    receivedQty?: number;
    utilizedQty?: number;
    balance?: number;
    assignedTo?: string;
    remark?: string;
    status?: string;
}