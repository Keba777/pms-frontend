import { Equipment } from "./equipment";
import { Labor } from "./labor";
import { Material } from "./material";
import { Request } from "./request";
import { Task } from "./task";
import { User } from "./user";

export interface WorkForceItem {
  man_power: string;
  qty: number;
  rate: number;
  est_hrs: number;
}

export interface MachineryItem {
  equipment: string;
  qty: number;
  rate: number;
  est_hrs: number;
}

export interface MaterialItem {
  material: string;
  qty: number;
  rate: number;
}

export interface Actuals {
  quantity: number | null;
  unit: string | null;
  start_date: Date | null;
  end_date: Date | null;
  progress: number | null;
  status:
  | "Not Started"
  | "Started"
  | "InProgress"
  | "Canceled"
  | "Onhold"
  | "Completed"
  | null;
  labor_cost: number | null;
  material_cost: number | null;
  equipment_cost: number | null;
  total_cost: number | null;
  work_force: WorkForceItem[] | null;
  machinery_list: MachineryItem[] | null;
  materials_list: MaterialItem[] | null;
}

export interface ProgressUpdateItem {
  id?: string;
  dateTime: string;
  fromProgress?: number;
  progress: number;
  remark?: string;
  status?: string;
  checkedBy?: string;
  approvedBy?: string;
  action?: string;
  summaryReport?: string;
  comment?: string;
  approvedDate?: string | null;
  userId?: string;
}

export interface Activity {
  id: string;
  activity_name: string;
  description?: string;
  task_id: string;
  task?: Task;
  priority: "Critical" | "High" | "Medium" | "Low";
  quantity?: number;
  unit: string;
  start_date: Date;
  end_date: Date;
  progress: number;
  status:
  | "Not Started"
  | "Started"
  | "InProgress"
  | "Canceled"
  | "Onhold"
  | "Completed";
  approvalStatus: "Approved" | "Not Approved" | "Pending";
  assignedUsers?: User[];
  requests?: Request[];
  resource: Material | Equipment | Labor;
  image?: string;
  labor_index_factor?: number;
  labor_utilization_factor?: number;
  labor_working_hours_per_day?: number;
  machinery_index_factor?: number;
  machinery_utilization_factor?: number;
  machinery_working_hours_per_day?: number;
  labor_cost?: number;
  material_cost?: number;
  equipment_cost?: number;
  total_cost?: number;
  work_force?: WorkForceItem[];
  machinery_list?: MachineryItem[];
  materials_list?: MaterialItem[];
  checked_by_name?: string;
  checked_by_date?: Date;
  actuals?: Actuals | null;
  progressUpdates?: ProgressUpdateItem[] | null;
  createdAt?: Date;
  updatedAt?: Date;
  attachments?: string[];
}

export interface CreateActivityInput {
  activity_name: string;
  description?: string;
  task_id: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  quantity?: number;
  unit: string;
  start_date: Date;
  end_date: Date;
  progress: number;
  status:
  | "Not Started"
  | "Started"
  | "InProgress"
  | "Canceled"
  | "Onhold"
  | "Completed";
  approvalStatus: "Approved" | "Not Approved" | "Pending";
  assignedUsers?: string[];
  image?: string;
  labor_index_factor?: number | null;
  labor_utilization_factor?: number | null;
  labor_working_hours_per_day?: number | null;
  machinery_index_factor?: number | null;
  machinery_utilization_factor?: number | null;
  machinery_working_hours_per_day?: number | null;
  labor_cost?: number | null;
  material_cost?: number | null;
  equipment_cost?: number | null;
  work_force?: WorkForceItem[];
  machinery_list?: MachineryItem[];
  materials_list?: MaterialItem[];
  checked_by_name?: string;
  checked_by_date?: Date;
  actuals?: Actuals | null;
  progressUpdates?: ProgressUpdateItem[] | null;
  attachments?: File[];
}

export interface UpdateActivityInput {
  id: string;
  activity_name?: string;
  description?: string;
  task_id?: string;
  priority?: "Critical" | "High" | "Medium" | "Low";
  quantity?: number;
  unit?: string;
  start_date?: Date;
  end_date?: Date;
  progress?: number;
  status?:
  | "Not Started"
  | "Started"
  | "InProgress"
  | "Canceled"
  | "Onhold"
  | "Completed";
  approvalStatus?: "Approved" | "Not Approved" | "Pending";
  assignedUsers?: string[];
  image?: string;
  labor_index_factor?: number;
  labor_utilization_factor?: number;
  labor_working_hours_per_day?: number;
  machinery_index_factor?: number;
  machinery_utilization_factor?: number;
  machinery_working_hours_per_day?: number;
  labor_cost?: number;
  material_cost?: number;
  equipment_cost?: number;
  work_force?: WorkForceItem[];
  machinery_list?: MachineryItem[];
  materials_list?: MaterialItem[];
  checked_by_name?: string;
  checked_by_date?: Date;
  actuals?: Actuals | null;
  progressUpdates?: ProgressUpdateItem[] | null;
  attachments?: File[];
  existingAttachments?: string[];
}
