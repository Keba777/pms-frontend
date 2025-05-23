import { Equipment } from "./equipment";
import { Labor } from "./labor";
import { Project } from "./project";
import { User } from "./user";
import { Warehouse } from "./warehouse";

export interface Site {
    id: string;
    name: string;
    users?: User[]
    projects?: Project[];
    warehouses?: Warehouse[]
    equipments?: Equipment[];
    labors?: Labor[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateSiteInput {
    name: string;
}

export interface UpdateSiteInput {
    id?: string;
    name?: string;
}