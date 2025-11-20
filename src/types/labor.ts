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
    estimatedHours?: number;
    rate?: number;
    overtimeRate?: number
    totalAmount?: number;
    skill_level?: string;
    responsiblePerson?: string
    laborInformations?: LaborInformation[];
    allocationStatus?: "Allocated" | "Unallocated" | "OnLeave"
    status?: "Active" | "InActive"
    utilization_factor?: number;
    totalTime?: number;
    startingDate?: Date;
    dueDate?: Date;
    shiftingDate?: Date;
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
    estimatedHours?: number;
    rate?: number;
    overtimeRate?: number
    totalAmount?: number;
    skill_level?: string;
    responsiblePerson?: string
    allocationStatus?: "Allocated" | "Unallocated" | "OnLeave"
    status?: "Active" | "InActive"
    utilization_factor?: number;
    totalTime?: number;
    startingDate?: Date;
    dueDate?: Date;
    shiftingDate?: Date;
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
  startingDate?: string;
  dueDate?: string;
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
    estimatedHours?: number;
    rate?: number;
    overtimeRate?: number
    totalAmount?: number;
    skill_level?: string;
    responsiblePerson?: string
    allocationStatus?: "Allocated" | "Unallocated" | "OnLeave"
    status?: "Active" | "InActive"
    utilization_factor?: number;
    totalTime?: number;
    startingDate?: Date;
    dueDate?: Date;
    shiftingDate?: Date;
}