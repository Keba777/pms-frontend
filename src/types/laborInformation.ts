export interface LaborInformation {
    id: string;
    firstName: string;
    lastName: string;
    laborId: string;
    startsAt: Date;
    endsAt: Date;
    status: 'Allocated' | 'Unallocated';
    profile_picture?: string;
}

export interface CreateLaborInformationInput {
    firstName: string;
    lastName: string;
    laborId: string;
    startsAt: Date;
    endsAt: Date;
    status: 'Allocated' | 'Unallocated';
}

export interface UpdateLaborInformationInput {
    id: string;
    firstName?: string;
    lastName?: string;
    laborId?: string;
    startsAt?: Date;
    endsAt?: Date;
    status?: 'Allocated' | 'Unallocated';
}