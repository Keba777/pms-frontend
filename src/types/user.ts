import { Activity } from "./activity";
import { Department } from "./department";
import { Project } from "./project";
import { Request } from "./request";
import { Site } from "./site";
import { Task } from "./task";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: string;
    role?: Role;
    email: string;
    password: string;
    profile_picture?: string;
    department_id?: string;
    department?: Department
    siteId: string;
    site?: Site
    responsiblities?: string[]
    access?: "Low Access" | "Full Access" | "Average Access";
    status?: "Active" | "InActive";
    projects?: Project[];
    tasks?: Task[];
    activities?: Activity[];
    requests?: Request[];
}

export interface CreateUserInput {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    password: string;
    department_id?: string;
    status?: "Active" | "InActive";
    role_name: string;
    siteId: string;
    responsiblities?: string[]
    access?: "Low Access" | "Full Access" | "Average Access";
}

export interface UpdateUserInput {
    id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    password?: string;
    profile_picture?: string;
    department_id?: string;
    status?: "Active" | "InActive";
    role_id?: string;
    siteId?: string;
    responsiblities?: string[]
    access?: "Low Access" | "Full Access" | "Average Access";
}

export type PermissionActions = "create" | "update" | "delete" | "manage";

export interface Permissions {
    [resource: string]: Partial<Record<PermissionActions, boolean>> | null;
}

export interface Role {
    id?: string;
    name: string;
    permissions?: Permissions | null;
}

export interface CreateRoleInput {
    name: string;
    permissions?: Permissions | null;
}

export interface UpdateRoleInput {
    id?: string;
    name: string;
    permissions?: Permissions | null;
}



export interface LoginCredential {
    email: string;
    password: string;
}

export interface UserLogin {
    user: User;
    token: string;
}

export interface RegisterUserData {
    user: User;
    token: string;
}
