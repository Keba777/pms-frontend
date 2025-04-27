import { Task } from "./task";
import { User } from "./user";

export interface Project {
    id: string;
    title: string;
    description?: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    budget: number;
    client: string;
    site: string;
    progress?: number;
    isFavourite?: boolean;
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    members?: User[];
    tagIds?: string[];
    tasks?: Task[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateProjectInput {
    title: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    budget: number;
    client: string;
    site: string;
    status: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    members?: string[];
    tagIds?: string[];
}

export interface UpdateProjectInput {
    id?: string;
    title?: string;
    description?: string;
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date?: Date;
    end_date?: Date;
    budget?: number;
    client?: string;
    site?: string;
    progress?: number;
    isFavourite?: boolean;
    status?: 'Not Started' | 'Started' | 'InProgress' | 'Canceled' | 'Onhold' | 'Completed';
    members?: string[];
    tagIds?: string[];
    tasks?: Task[];
}
