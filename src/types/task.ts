import { Activity } from "./activity";
import { Project } from "./project";

export interface Task {
    id: string;
    task_name: string;
    project_id: string;
    project?: Project;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    start_date: Date;
    end_date: Date;
    progress: number;
    activities?: Activity[];
}