export interface LaborInformation {
    id: string;
    firstName: string;
    lastName: string;
    laborId: string;
    startsAt: Date;
    endsAt: Date;
    status: 'Allocated' | 'Unallocated' | 'OnLeave';
    profile_picture?: string;
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string;
    estimatedHours?: number;
    rate?: number;
    overtimeRate?: number;
    totalAmount?: number;
    skill_level?: string;
    utilization_factor?: number;
    totalTime?: number;
    phone?: string;
    shiftingDate?: Date;
}

export interface CreateLaborInformationInput {
    firstName: string;
    lastName: string;
    laborId: string;
    startsAt: Date;
    endsAt: Date;
    status: 'Allocated' | 'Unallocated' | 'OnLeave';
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string;
    estimatedHours?: number;
    rate?: number;
    overtimeRate?: number;
    totalAmount?: number;
    skill_level?: string;
    utilization_factor?: number;
    totalTime?: number;
    phone?: string;
    shiftingDate?: Date;
}

export interface UpdateLaborInformationInput {
    id: string;
    firstName?: string;
    lastName?: string;
    laborId?: string;
    startsAt?: Date;
    endsAt?: Date;
    status?: 'Allocated' | 'Unallocated' | 'OnLeave';
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string;
    estimatedHours?: number;
    rate?: number;
    overtimeRate?: number;
    totalAmount?: number;
    skill_level?: string;
    utilization_factor?: number;
    totalTime?: number;
    phone?: string;
    shiftingDate?: Date;
}