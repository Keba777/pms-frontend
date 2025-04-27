import { Activity } from "./activity";
import { Project } from "./project";
import { User } from "./user";

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
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    approvalStatus: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: User[];
    activities?: Activity[];
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
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    approvalStatus: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: string[];
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
    status?: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    approvalStatus?: 'Approved' | 'Not Approved' | 'Pending';
    assignedUsers?: string[];
}
