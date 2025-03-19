import { Task } from "./task";

export interface Activity {
    id: string;
    activity_name: string;
    task_id: string;
    task?: Task;
    unit: string;
    progress: number;
    status: string;
    resource: string;
}