import { Site } from "./site";
import { Task } from "./task";
import { User } from "./user";
import { ProgressUpdateItem } from "./activity";

export type ProjectStatus =
  | "Not Started"
  | "Started"
  | "InProgress"
  | "Canceled"
  | "Onhold"
  | "Completed";

export interface ProjectActuals {
  start_date?: Date | null;
  end_date?: Date | null;
  progress?: number | null;
  status?: ProjectStatus | null;
  budget?: number | string | null;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  start_date: Date;
  end_date: Date;
  budget: number;
  client: string;
  site_id?: string;
  site?: Site;
  progress?: number;
  isFavourite?: boolean;
  status: ProjectStatus;
  members?: User[];
  tagIds?: string[];
  tasks?: Task[];
  actuals?: ProjectActuals | null;
  progressUpdates?: ProgressUpdateItem[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  start_date: Date;
  end_date: Date;
  budget: number;
  progress?: number;
  client: string;
  site_id?: string;
  status: ProjectStatus;
  members?: string[];
  actuals?: ProjectActuals | null;
  progressUpdates?: ProgressUpdateItem[] | null;
}

export interface UpdateProjectInput {
  id?: string;
  title?: string;
  description?: string;
  priority?: "Critical" | "High" | "Medium" | "Low";
  start_date?: Date;
  end_date?: Date;
  budget?: number;
  client?: string;
  site_id?: string;
  progress?: number;
  isFavourite?: boolean;
  status?: ProjectStatus;
  members?: string[];
  actuals?: ProjectActuals | null;
  progressUpdates?: ProgressUpdateItem[] | null;
}
