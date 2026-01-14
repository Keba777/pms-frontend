import { LaborInformation } from "./laborInformation";
import { Site } from "./site";

export interface Labor {
    id: string;
    role: string;
    siteId: string;
    site?: Site
    unit: string;
    quantity?: number
    minQuantity?: number;
    laborInformations?: LaborInformation[];
    status?: "Active" | "InActive"
    responsiblePerson?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateLaborInput {
    role: string;
    siteId: string;
    site?: Site
    unit: string;
    quantity?: number
    minQuantity?: number;
    status?: "Active" | "InActive"
    responsiblePerson?: string;
}

export interface LooseLaborInput {
    role?: string;
    unit?: string;
    quantity?: string;
    minQuantity?: string;
    estimatedHours?: string;
    rate?: string;
    overtimeRate?: string;
    totalAmount?: string;
    responsiblePerson?: string;
    allocationStatus?: string;
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string
}

export interface UpdateLaborInput {
    id: string;
    role?: string;
    siteId?: string;
    site?: Site
    unit: string;
    quantity?: number
    minQuantity?: number;
    status?: "Active" | "InActive"
    responsiblePerson?: string;
}