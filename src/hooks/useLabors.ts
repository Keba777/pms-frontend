"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Labor, CreateLaborInput, UpdateLaborInput } from "@/types/labor";
import { useLaborStore } from "@/store/laborStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ----------------------------
// API functions
// ----------------------------

// Fetch all labors
const fetchLabors = async (): Promise<Labor[]> => {
  const response = await apiClient.get<ApiResponse<Labor[]>>("/labors");
  return response.data.data;
};

// Fetch labor details by ID
export const fetchLaborById = async (id: string): Promise<Labor | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Labor>>(`/labors/${id}`);
    return response.data.data;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch labor");
  }
};

// Create a new labor
const createLabor = async (data: CreateLaborInput): Promise<Labor> => {
  const response = await apiClient.post<ApiResponse<Labor>>("/labors", data);
  return response.data.data;
};

// Import multiple labors (multipart/form-data)
const importLabors = async (formData: FormData): Promise<Labor[]> => {
  const response = await apiClient.post<ApiResponse<Labor[]>>("/labors/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Update an existing labor
const updateLabor = async (data: UpdateLaborInput): Promise<Labor> => {
  const response = await apiClient.put<ApiResponse<Labor>>(`/labors/${data.id}`, data);
  return response.data.data;
};

// Delete a labor
const deleteLabor = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/labors/${id}`);
  return response.data.data;
};

// ----------------------------
// Helper: build FormData for import (important columns only)
// ----------------------------
/**
 * Important columns:
 * - Labor: role, siteId, unit, quantity, rate, status
 * - LaborInformation: firstName, lastName, startsAt, endsAt, status, fileName (optional)
 *
 * files: optional File[] appended under key "files" (server expects multer().array("files"))
 */
export const buildLaborImportFormData = (labors: any[], files?: File[]) => {
  const fd = new FormData();

  const cleanLabors = labors.map((l) => {
    const laborObj: any = {
      role: l.role,
      siteId: l.siteId,
    };

    if (l.unit != null) laborObj.unit = l.unit;
    if (l.quantity != null) laborObj.quantity = l.quantity;
    if (l.rate != null) laborObj.rate = l.rate;
    if (l.status != null) laborObj.status = l.status;

    if (Array.isArray(l.laborInformations)) {
      laborObj.laborInformations = l.laborInformations.map((info: any) => {
        const infoObj: any = {
          firstName: info.firstName,
          lastName: info.lastName,
          startsAt: info.startsAt,
          endsAt: info.endsAt,
        };
        if (info.status != null) infoObj.status = info.status;
        if (info.fileName != null) infoObj.fileName = info.fileName;
        return infoObj;
      });
    } else if (l.firstName && l.lastName && l.startsAt && l.endsAt) {
      laborObj.laborInformations = [
        {
          firstName: l.firstName,
          lastName: l.lastName,
          startsAt: l.startsAt,
          endsAt: l.endsAt,
          status: l.status ?? undefined,
          fileName: l.fileName ?? undefined,
        },
      ];
    }

    return laborObj;
  });

  fd.append("labors", JSON.stringify(cleanLabors));

  if (files && files.length > 0) {
    files.forEach((f) => fd.append("files", f));
  }

  return fd;
};

// ----------------------------
// React Query Hooks
// ----------------------------

import { useSearchStore } from "@/store/searchStore";

// Hook to fetch all labors and update the store
export const useLabors = () => {
  const setLabors = useLaborStore((state) => state.setLabors);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery({
    queryKey: ["labors"],
    queryFn: fetchLabors,
    select: (labors) => {
      const filtered = labors.filter((l) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          l.role.toLowerCase().includes(q) ||
          l.responsiblePerson?.toLowerCase().includes(q) ||
          l.status?.toLowerCase().includes(q)
        );
      });
      return filtered;
    }
  });

  useEffect(() => {
    if (query.data) {
      setLabors(query.data);
    }
  }, [query.data, setLabors]);

  return query;
};

// Hook to fetch a labor by ID
export const useLabor = (id: string) => {
  return useQuery<Labor | null, Error>({
    queryKey: ["labor", id],
    queryFn: () => fetchLaborById(id),
    enabled: !!id,
  });
};

// Hook to create a new labor and refresh labors list
export const useCreateLabor = (onSuccess?: (labor: Labor) => void) => {
  const queryClient = useQueryClient();
  const addLabor = useLaborStore((state) => state.addLabor);

  return useMutation({
    mutationFn: createLabor,
    onSuccess: (labor) => {
      toast.success("Labor created successfully!");
      queryClient.invalidateQueries({ queryKey: ["labors"] });
      addLabor(labor);
      if (onSuccess) onSuccess(labor);
    },
    onError: () => {
      toast.error("Failed to create labor");
    },
  });
};

// Hook to import multiple labors and refresh labors list
export const useImportLabors = (onSuccess?: (labors: Labor[]) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importLabors,
    onSuccess: (labors) => {
      toast.success("Labors imported successfully!");
      queryClient.invalidateQueries({ queryKey: ["labors"] });
      if (onSuccess) onSuccess(labors);
    },
    onError: () => {
      toast.error("Failed to import labors");
    },
  });
};

// Hook to update a labor and refresh labors list
export const useUpdateLabor = () => {
  const queryClient = useQueryClient();
  const updateLaborInStore = useLaborStore((s) => s.updateLabor);

  return useMutation<Labor, unknown, UpdateLaborInput>({
    mutationFn: updateLabor,
    onSuccess: (updated) => {
      toast.success("Labor updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["labors"] });
      updateLaborInStore(updated);
    },
    onError: () => {
      toast.error("Failed to update labor");
    },
  });
};

// Hook to delete a labor and refresh labors list
export const useDeleteLabor = () => {
  const queryClient = useQueryClient();
  const deleteLaborFromStore = useLaborStore((state) => state.deleteLabor);

  return useMutation({
    mutationFn: deleteLabor,
    onSuccess: (_, variables) => {
      toast.success("Labor deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["labors"] });
      deleteLaborFromStore(variables);
    },
    onError: () => {
      toast.error("Failed to delete labor");
    },
  });
};
