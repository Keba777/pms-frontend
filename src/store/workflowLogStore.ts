import { WorkflowLog } from "@/types/workflowLog";
import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

type EntityKey = string; // e.g., "Project-abc123" or "Task-xyz456"

interface WorkflowLogStore {
    workflowLogs: Record<EntityKey, WorkflowLog[]>;
    setWorkflowLogs: (entityType: string, entityId: string, logs: WorkflowLog[]) => void;
    addWorkflowLog: (entityType: string, entityId: string, log: WorkflowLog) => void;
    updateWorkflowLog: (entityType: string, entityId: string, updatedLog: WorkflowLog) => void;
    deleteWorkflowLog: (entityType: string, entityId: string, logId: string) => void;
}

export const useWorkflowLogStore = create<WorkflowLogStore>()(
    persist(
        (set, get) => ({
            workflowLogs: {},

            setWorkflowLogs: (entityType, entityId, logs) => {
                const key = `${entityType}-${entityId}`;
                set((state) => ({
                    workflowLogs: {
                        ...state.workflowLogs,
                        [key]: logs,
                    },
                }));
            },

            addWorkflowLog: (entityType, entityId, log) => {
                const key = `${entityType}-${entityId}`;
                const existingLogs = get().workflowLogs[key] || [];
                set((state) => ({
                    workflowLogs: {
                        ...state.workflowLogs,
                        [key]: [...existingLogs, log],
                    },
                }));
            },

            updateWorkflowLog: (entityType, entityId, updatedLog) => {
                const key = `${entityType}-${entityId}`;
                const existingLogs = get().workflowLogs[key] || [];
                set((state) => ({
                    workflowLogs: {
                        ...state.workflowLogs,
                        [key]: existingLogs.map((log) =>
                            log.id === updatedLog.id ? updatedLog : log
                        ),
                    },
                }));
            },

            deleteWorkflowLog: (entityType, entityId, logId) => {
                const key = `${entityType}-${entityId}`;
                const existingLogs = get().workflowLogs[key] || [];
                set((state) => ({
                    workflowLogs: {
                        ...state.workflowLogs,
                        [key]: existingLogs.filter((log) => log.id !== logId),
                    },
                }));
            },
        }),
        {
            name: "workflow-log-store",
            storage: {
                getItem: (name: string): StorageValue<WorkflowLogStore> | null => {
                    const item = localStorage.getItem(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<WorkflowLogStore>): void => {
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name: string): void => {
                    localStorage.removeItem(name);
                },
            } as PersistStorage<WorkflowLogStore>,
        }
    )
);
