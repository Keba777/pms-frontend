import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import {
    LaborTimesheet,
    createLaborTimesheetInput,
    updateLaborTimesheetInput,
    EquipmentTimesheet,
    createEquipmentTimesheetInput,
    updateEquipmentTimesheetInput,
    MaterialBalanceSheet,
    createMaterialBalanceSheetInput,
    updateMaterialBalanceSheetInput,
} from "@/types/timesheet";
import { toast } from "react-toastify";

// ----------------------------
// API functions
// ----------------------------
interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// --- Labor Timesheets ---
const fetchLaborTimesheets = async (): Promise<LaborTimesheet[]> => {
    const response = await apiClient.get<ApiResponse<LaborTimesheet[]>>(
        "/timesheets/labor"
    );
    return response.data.data;
};

const fetchLaborTimesheetById = async (
    id: string
): Promise<LaborTimesheet | null> => {
    try {
        const response = await apiClient.get<ApiResponse<LaborTimesheet>>(
            `/timesheets/labor/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching labor timesheet:", error);
        return null;
    }
};

const createLaborTimesheet = async (
    data: createLaborTimesheetInput
): Promise<LaborTimesheet> => {
    const response = await apiClient.post<ApiResponse<LaborTimesheet>>(
        "/timesheets/labor",
        data
    );
    return response.data.data;
};

const updateLaborTimesheet = async (
    data: updateLaborTimesheetInput & { id: string }
): Promise<LaborTimesheet> => {
    const response = await apiClient.put<ApiResponse<LaborTimesheet>>(
        `/timesheets/labor/${data.id}`,
        data
    );
    return response.data.data;
};

const deleteLaborTimesheet = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/timesheets/labor/${id}`
    );
    return response.data.data;
};

// --- Equipment Timesheets ---
const fetchEquipmentTimesheets = async (): Promise<EquipmentTimesheet[]> => {
    const response = await apiClient.get<ApiResponse<EquipmentTimesheet[]>>(
        "/timesheets/equipment"
    );
    return response.data.data;
};

const fetchEquipmentTimesheetById = async (
    id: string
): Promise<EquipmentTimesheet | null> => {
    try {
        const response = await apiClient.get<ApiResponse<EquipmentTimesheet>>(
            `/timesheets/equipment/${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching equipment timesheet:", error);
        return null;
    }
};

const createEquipmentTimesheet = async (
    data: createEquipmentTimesheetInput
): Promise<EquipmentTimesheet> => {
    const response = await apiClient.post<ApiResponse<EquipmentTimesheet>>(
        "/timesheets/equipment",
        data
    );
    return response.data.data;
};

const updateEquipmentTimesheet = async (
    data: updateEquipmentTimesheetInput & { id: string }
): Promise<EquipmentTimesheet> => {
    const response = await apiClient.put<ApiResponse<EquipmentTimesheet>>(
        `/timesheets/equipment/${data.id}`,
        data
    );
    return response.data.data;
};

const deleteEquipmentTimesheet = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/timesheets/equipment/${id}`
    );
    return response.data.data;
};

// --- Material Balance Sheets ---
const fetchMaterialSheets = async (): Promise<MaterialBalanceSheet[]> => {
    const response = await apiClient.get<ApiResponse<MaterialBalanceSheet[]>>(
        "/timesheets/material"
    );
    return response.data.data;
};

const fetchMaterialSheetById = async (
    id: string
): Promise<MaterialBalanceSheet | null> => {
    try {
        const response = await apiClient.get<ApiResponse<MaterialBalanceSheet>>(
            `/timesheets/material${id}`
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching material sheet:", error);
        return null;
    }
};

const createMaterialSheet = async (
    data: createMaterialBalanceSheetInput
): Promise<MaterialBalanceSheet> => {
    const response = await apiClient.post<ApiResponse<MaterialBalanceSheet>>(
        "/timesheets/material",
        data
    );
    return response.data.data;
};

const updateMaterialSheet = async (
    data: updateMaterialBalanceSheetInput & { id: string }
): Promise<MaterialBalanceSheet> => {
    const response = await apiClient.put<ApiResponse<MaterialBalanceSheet>>(
        `/timesheets/material/${data.id}`,
        data
    );
    return response.data.data;
};

const deleteMaterialSheet = async (
    id: string
): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/timesheets/material/${id}`
    );
    return response.data.data;
};

// ----------------------------
// React Query Hooks
// ----------------------------
import { useSearchStore } from "@/store/searchStore";

export const useLaborTimesheets = () => {
    const searchQuery = useSearchStore((s) => s.searchQuery);
    return useQuery<LaborTimesheet[], Error>({
        queryKey: ["labor-timesheets"],
        queryFn: fetchLaborTimesheets,
        select: (data) => {
            const filtered = data.filter((t) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return t.status.toLowerCase().includes(q);
            });
            return filtered;
        }
    });
};

export const useLaborTimesheet = (id: string) => {
    return useQuery<LaborTimesheet | null, Error>({
        queryKey: ["labor-timesheet", id],
        queryFn: () => fetchLaborTimesheetById(id),
        enabled: !!id,
    });
};

export const useCreateLaborTimesheet = (onSuccess?: (t: LaborTimesheet) => void) => {
    const queryClient = useQueryClient();
    return useMutation<LaborTimesheet, Error, createLaborTimesheetInput>({
        mutationFn: createLaborTimesheet,
        onSuccess: (data) => {
            toast.success("Labor timesheet created");
            queryClient.invalidateQueries({ queryKey: ["labor-timesheets"] });
            if (onSuccess) onSuccess(data);
        },
        onError: () => toast.error("Failed to create labor timesheet"),
    });
};

export const useUpdateLaborTimesheet = () => {
    const queryClient = useQueryClient();
    return useMutation<LaborTimesheet, Error, updateLaborTimesheetInput & { id: string }>({
        mutationFn: updateLaborTimesheet,
        onSuccess: () => {
            toast.success("Labor timesheet updated");
            queryClient.invalidateQueries({ queryKey: ["labor-timesheets"] });
        },
        onError: () => toast.error("Failed to update labor timesheet"),
    });
};

export const useDeleteLaborTimesheet = () => {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, Error, string>({
        mutationFn: deleteLaborTimesheet,
        onSuccess: () => {
            toast.success("Labor timesheet deleted");
            queryClient.invalidateQueries({ queryKey: ["labor-timesheets"] });
        },
        onError: () => toast.error("Failed to delete labor timesheet"),
    });
};

export const useEquipmentTimesheets = () => {
    const searchQuery = useSearchStore((s) => s.searchQuery);
    return useQuery<EquipmentTimesheet[], Error>({
        queryKey: ["equipment-timesheets"],
        queryFn: fetchEquipmentTimesheets,
        select: (data) => {
            const filtered = data.filter((t) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return t.status.toLowerCase().includes(q);
            });
            return filtered;
        }
    });
};

export const useEquipmentTimesheet = (id: string) => {
    return useQuery<EquipmentTimesheet | null, Error>({
        queryKey: ["equipment-timesheet", id],
        queryFn: () => fetchEquipmentTimesheetById(id),
        enabled: !!id,
    });
};

export const useCreateEquipmentTimesheet = (onSuccess?: (t: EquipmentTimesheet) => void) => {
    const queryClient = useQueryClient();
    return useMutation<EquipmentTimesheet, Error, createEquipmentTimesheetInput>({
        mutationFn: createEquipmentTimesheet,
        onSuccess: (data) => {
            toast.success("Equipment timesheet created");
            queryClient.invalidateQueries({ queryKey: ["equipment-timesheets"] });
            if (onSuccess) onSuccess(data);
        },
        onError: () => toast.error("Failed to create equipment timesheet"),
    });
};

export const useUpdateEquipmentTimesheet = () => {
    const queryClient = useQueryClient();
    return useMutation<EquipmentTimesheet, Error, updateEquipmentTimesheetInput & { id: string }>({
        mutationFn: updateEquipmentTimesheet,
        onSuccess: () => {
            toast.success("Equipment timesheet updated");
            queryClient.invalidateQueries({ queryKey: ["equipment-timesheets"] });
        },
        onError: () => toast.error("Failed to update equipment timesheet"),
    });
};

export const useDeleteEquipmentTimesheet = () => {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, Error, string>({
        mutationFn: deleteEquipmentTimesheet,
        onSuccess: () => {
            toast.success("Equipment timesheet deleted");
            queryClient.invalidateQueries({ queryKey: ["equipment-timesheets"] });
        },
        onError: () => toast.error("Failed to delete equipment timesheet"),
    });
};

export const useMaterialSheets = () => {
    const searchQuery = useSearchStore((s) => s.searchQuery);
    return useQuery<MaterialBalanceSheet[], Error>({
        queryKey: ["material-sheets"],
        queryFn: fetchMaterialSheets,
        select: (data) => {
            const filtered = data.filter((t) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                    t.status.toLowerCase().includes(q) ||
                    t.assignedTo.toLowerCase().includes(q)
                );
            });
            return filtered;
        }
    });
};

export const useMaterialSheet = (id: string) => {
    return useQuery<MaterialBalanceSheet | null, Error>({
        queryKey: ["material-sheet", id],
        queryFn: () => fetchMaterialSheetById(id),
        enabled: !!id,
    });
};

export const useCreateMaterialSheet = (onSuccess?: (t: MaterialBalanceSheet) => void) => {
    const queryClient = useQueryClient();
    return useMutation<MaterialBalanceSheet, Error, createMaterialBalanceSheetInput>({
        mutationFn: createMaterialSheet,
        onSuccess: (data) => {
            toast.success("Material sheet created");
            queryClient.invalidateQueries({ queryKey: ["material-sheets"] });
            if (onSuccess) onSuccess(data);
        },
        onError: () => toast.error("Failed to create material sheet"),
    });
};

export const useUpdateMaterialSheet = () => {
    const queryClient = useQueryClient();
    return useMutation<MaterialBalanceSheet, Error, updateMaterialBalanceSheetInput & { id: string }>({
        mutationFn: updateMaterialSheet,
        onSuccess: () => {
            toast.success("Material sheet updated");
            queryClient.invalidateQueries({ queryKey: ["material-sheets"] });
        },
        onError: () => toast.error("Failed to update material sheet"),
    });
};

export const useDeleteMaterialSheet = () => {
    const queryClient = useQueryClient();
    return useMutation<{ message: string }, Error, string>({
        mutationFn: deleteMaterialSheet,
        onSuccess: () => {
            toast.success("Material sheet deleted");
            queryClient.invalidateQueries({ queryKey: ["material-sheets"] });
        },
        onError: () => toast.error("Failed to delete material sheet"),
    });
};
