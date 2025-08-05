export interface WorkflowLog {
    id?: string;
    entityType: "Project" | "Task" | "Activity" | "Approval";
    entityId: string;
    action: string;
    status?: string;
    userId: string;
    details?: string;
}