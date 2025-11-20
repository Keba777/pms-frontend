export interface LaborInformation {
    id: string;
    firstName: string;
    lastName: string;
    laborId: string;
    startsAt: Date;
    endsAt: Date;
    status: 'Allocated' | 'Unallocated';
    profile_picture?: string;
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string
}

export interface CreateLaborInformationInput {
    firstName: string;
    lastName: string;
    laborId: string;
    startsAt: Date;
    endsAt: Date;
    status: 'Allocated' | 'Unallocated';
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string
}

export interface UpdateLaborInformationInput {
    id: string;
    firstName?: string;
    lastName?: string;
    laborId?: string;
    startsAt?: Date;
    endsAt?: Date;
    status?: 'Allocated' | 'Unallocated';
    position?: string;
    sex?: 'Male' | 'Female';
    terms?: 'Part Time' | 'Contract' | 'Temporary' | 'Permanent';
    estSalary?: number;
    educationLevel?: string
}