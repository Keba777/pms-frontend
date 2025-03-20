import { Activity } from "./activity";
import { Project } from "./project";

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
    assignedTo: string | null; // reference to the user table, can be null
    activities?: Activity[];
}