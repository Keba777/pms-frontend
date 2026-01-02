"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { AppFile, CreateFileInput, UpdateFileInput } from "@/types/file";
import { useFileStore } from "@/store/fileStore";
import { toast } from "react-toastify";
import { useSearchStore } from "@/store/searchStore";

// ----------------------------
// API functions
// ----------------------------
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Fetch all files
const fetchFiles = async (): Promise<AppFile[]> => {
  const response = await apiClient.get<ApiResponse<AppFile[]>>("/files");
  return response.data.data;
};

// Fetch file by ID
const fetchFileById = async (id: string): Promise<AppFile | null> => {
  try {
    const response = await apiClient.get<ApiResponse<AppFile>>(`/files/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching file:", error);
    return null;
  }
};

const createFile = async (data: CreateFileInput): Promise<AppFile[]> => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("sendTo", data.sendTo);
  formData.append("type", data.type);
  formData.append("referenceId", data.referenceId);

  data.files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  const response = await apiClient.post<ApiResponse<AppFile[]>>("/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// Update a file
const updateFile = async (data: UpdateFileInput): Promise<AppFile> => {
  const response = await apiClient.put<ApiResponse<AppFile>>(`/files/${data.id}`, data);
  return response.data.data;
};

// Delete a file
const deleteFile = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/files/${id}`);
  return response.data.data;
};


export const useFiles = () => {
  const setFiles = useFileStore((s) => s.setFiles);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery<AppFile[], Error>({
    queryKey: ["files"],
    queryFn: fetchFiles,
    select: (data) => {
      const filtered = data.filter((f) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          f.title.toLowerCase().includes(q) ||
          f.fileName.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q)
        );
      });
      return filtered;
    }
  });

  if (query.data) setFiles(query.data);
  return query;
};

export const useFile = (id: string) => {
  return useQuery<AppFile | null, Error>({
    queryKey: ["file", id],
    queryFn: () => fetchFileById(id),
    enabled: !!id,
  });
};

export const useCreateFile = () => {
  const queryClient = useQueryClient();
  const addFile = useFileStore((s) => s.addFile);

  return useMutation({
    mutationFn: createFile,
    onSuccess: (files) => {
      toast.success("File(s) uploaded successfully!");
      files.forEach(addFile);
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: () => toast.error("Failed to upload file(s)"),
  });
};

export const useUpdateFile = () => {
  const queryClient = useQueryClient();
  const updateFileInStore = useFileStore((s) => s.updateFile);

  return useMutation({
    mutationFn: updateFile,
    onSuccess: (updatedFile) => {
      toast.success("File updated successfully!");
      updateFileInStore(updatedFile);
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: () => toast.error("Failed to update file"),
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const deleteFileFromStore = useFileStore((s) => s.deleteFile);

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: (_, id) => {
      toast.success("File deleted successfully!");
      deleteFileFromStore(id as string);
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: () => toast.error("Failed to delete file"),
  });
};
