import { Project } from "./project";

export interface IClient {
    id: string;
    companyName: string;
    responsiblePerson?: string;
    description?: string;
    attachments?: string[];
    status: "Active" | "Inactive";
    projects?: Project[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateClientData {
    companyName: string;
    responsiblePerson?: string;
    description?: string;
    attachments?: string[];
    status?: "Active" | "Inactive";
}

export interface UpdateClientData extends Partial<CreateClientData> {}
