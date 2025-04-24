import { Task } from "./task";

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
    members?: string[];  // Optional array of member IDs
    tagIds?: string[];  // Optional array of tag IDs
    tasks?: Task[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateProjectInput {
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
