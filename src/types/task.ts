import { Activity } from "./activity";
import { Project } from "./project";
import { User } from "./user";
import { ProgressUpdateItem } from "./activity"; 

export type TaskStatus = 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';

export interface TaskActuals {
    start_date?: Date | null;
    end_date?: Date | null;
    progress?: number | null;
    status?: TaskStatus | null;
    budget?: number | string | null;
}

export interface Task {
    id: string;
    task_name: string;
    description?: string;
    project_id: string;
    project?: Project;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    progress?: number;
    status: TaskStatus;
    approvalStatus: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: User[];
    activities?: Activity[];
    budget?: number | string;
    actuals?: TaskActuals | null;
    progressUpdates?: ProgressUpdateItem[] | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateTaskInput {
    task_name: string;
    description?: string;
    project_id: string;
    project?: Project;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    progress?: number;
    status: TaskStatus;
    approvalStatus: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: string[];
    budget?: number | string;
    actuals?: TaskActuals | null;
    progressUpdates?: ProgressUpdateItem[] | null;
}

export interface UpdateTaskInput {
    id?: string;
    task_name?: string;
    description?: string;
    project_id?: string;
    project?: Project;
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date?: Date;
    end_date?: Date;
    progress?: number;
    status?: TaskStatus;
    approvalStatus?: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: string[];
    budget?: number | string | null;
    actuals?: TaskActuals | null;
    progressUpdates?: ProgressUpdateItem[] | null;
}
