import { Activity } from "./activity";
import { Department } from "./department";
import { Site } from "./site";
import { Project } from "./project";
import { Task } from "./task";
import { User } from "./user";

export interface Issue {
    id: string;
    date: Date;
    issueType: string;
    description: string;
    raisedById: string;
    raisedBy: User;
    priority: "Urgent" | "Medium" | "Low";
    siteId?: string;
    site?: Site;
    departmentId?: string;
    department?: Department;
    responsibleId?: string;
    responsible?: User;
    actionTaken?: string;
    status: "Open" | "In Progress" | "Resolved" | "Closed";

    // Only one of these may be set at a time:
    activityId?: string;
    activity?: Activity;
    projectId?: string;
    project?: Project;
    taskId?: string;
    task?: Task;

    createdAt: Date;
    updatedAt: Date;
}

export interface CreateIssueInput {
    date: Date;
    issueType: string;
    description: string;
    raisedById: string;
    priority?: "Urgent" | "Medium" | "Low";
    siteId?: string;
    departmentId?: string;
    responsibleId?: string;
    actionTaken?: string;
    status: "Open" | "In Progress" | "Resolved" | "Closed";

    // Only one of these should be set:
    activityId?: string;
    projectId?: string;
    taskId?: string;
}

export interface UpdateIssueInput {
    id: string;
    date?: Date;
    issueType?: string;
    description?: string;
    raisedById?: string;
    priority?: "Urgent" | "Medium" | "Low";
    siteId?: string;
    departmentId?: string;
    responsibleId?: string;
    actionTaken?: string;
    status?: "Open" | "In Progress" | "Resolved" | "Closed";

    activityId?: string;
    projectId?: string;
    taskId?: string;
}
