import { Task } from "./task";

export interface Project {
    id: string;
    title: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    budget: number;
    client: string;
    site: string;
    progress: number;
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    tasks?: Task[];
}

export interface CreateProjectInput {
    title: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    budget: number;
    client: string;
    site: string;
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    tasks?: Task[];
}

export interface UpdateProjectInput {
    id: string;
    title?: string;
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date?: Date;
    end_date?: Date;
    budget?: number;
    client?: string;
    site?: string;
    progress?: number;
    status?: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    tasks?: Task[];
}
