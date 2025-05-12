import { Project } from "./project";

export interface Site {
    id: string;
    name: string;
    projects?: Project[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateSiteInput {
    name: string;
}

export interface UpdateSiteInput {
    id: string;
    name: string;
}