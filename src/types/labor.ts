export interface Labor {
    id: string;
    total_labor: number;
    hourly_rate: number;
    skill_level?: string;
    activity_id: string;
}
export interface CreateLaborInput {
    total_labor: number;
    hourly_rate: number;
    skill_level?: string;
    activity_id: string;
}
export interface UpdateLaborInput {
    id: string;
    total_labor?: number;
    hourly_rate?: number;
    skill_level?: string;
    activity_id?: string;
}