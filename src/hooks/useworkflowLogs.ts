"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { WorkflowLog } from "@/types/workflowLog";
import { useWorkflowLogStore } from "@/store/workflowLogStore";
import { useEffect } from "react";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const fetchWorkflowLogsByEntity = async (
    entityType: string,
    entityId: string
): Promise<WorkflowLog[]> => {
    const response = await apiClient.get<ApiResponse<WorkflowLog[]>>(
        `/workflow-logs/${entityType}/${entityId}`
    );
    return response.data.data;
};


const fetchWorkflowLogById = async (id: string): Promise<WorkflowLog | null> => {
    const response = await apiClient.get<ApiResponse<WorkflowLog>>(`/workflow-logs/${id}`);
    return response.data.data;
};


export const useWorkflowLogs = (entityType: string, entityId: string) => {
    const setWorkflowLogs = useWorkflowLogStore((state) => state.setWorkflowLogs);
    const key = `${entityType}-${entityId}`;

    const query = useQuery({
        queryKey: ["workflow-logs", entityType, entityId],
        queryFn: () => fetchWorkflowLogsByEntity(entityType, entityId),
        enabled: !!entityType && !!entityId,
    });

    useEffect(() => {
        if (query.data) {
            setWorkflowLogs(entityType, entityId, query.data);
        }
    }, [query.data, entityType, entityId, setWorkflowLogs]);

    return query;
};


export const useWorkflowLog = (id: string) => {
    return useQuery<WorkflowLog | null, Error>({
        queryKey: ["workflow-log", id],
        queryFn: () => fetchWorkflowLogById(id),
        enabled: !!id,
    });
};
