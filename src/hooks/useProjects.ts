// hooks/useProjects.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api-client";
import { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import { useProjectStore } from "@/store/projectStore";
import { toast } from "react-toastify";
import { useEffect } from "react";

// ----------------------------
// API functions (fixed)
// ----------------------------

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchProjects = async (): Promise<Project[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Project[]>>("/projects");
    return response.data.data;
  } catch (error) {
    console.log(error)
    throw new Error("Failed to fetch projects");
  }
};

const fetchProjectById = async (id: string): Promise<Project | null> => {
  try {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
};

const createProject = async (data: CreateProjectInput | FormData): Promise<Project> => {
  const response = await apiClient.post<ApiResponse<Project>>("/projects", data);
  return response.data.data;
};

const updateProject = async (data: UpdateProjectInput | FormData): Promise<Project> => {
  let id: string | undefined;
  if (data instanceof FormData) {
    id = data.get('id') as string;
  } else {
    id = data.id;
  }

  if (!id) throw new Error("Project ID is required for update");

  const response = await apiClient.put<ApiResponse<Project>>(
    `/projects/${id}`,
    data
  );
  return response.data.data;
};

const deleteProject = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    `/projects/${id}`
  );
  return response.data.data;
};

const updateProjectActuals = async (payload: { id: string; actuals: any }): Promise<Project> => {
  const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${payload.id}/actuals`, { actuals: payload.actuals });
  return response.data.data;
};

const updateProjectProgress = async (data: any): Promise<Project> => {
  const { projectId, ...body } = data;
  const response = await apiClient.put<ApiResponse<Project>>(`/projects/${projectId}/progress`, body);
  return response.data.data;
};

// ----------------------------
// Updated React Query hooks
// ----------------------------

import { useSearchStore } from "@/store/searchStore";

// Hook to fetch all Projects and update the store
export const useProjects = () => {
  const setProjects = useProjectStore((s) => s.setProjects);
  const searchQuery = useSearchStore((s) => s.searchQuery);

  const query = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    select: (projects) => {
      const filtered = projects.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.status?.toLowerCase().includes(q)
        );
      });

      return filtered
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() -
            new Date(b.createdAt!).getTime()
        );
    }
  });

  useEffect(() => {
    // Note: If we use 'select', query.data is already filtered/sorted. 
    // However, if we want to store the FULL list in the store, we should perhaps separate fetching vs filtering.
    // The current pattern sets the STORE to the result of the query. 
    // If we return filtered data here, the store gets filtered data. 
    // This implies that if I clear search, it refetches? No, React Query caches the raw data but 'select' runs on it.
    // Actually, 'query.data' usually refers to the result of select function.
    // So the store will receive filtered projects. This is fine for now as long as we don't rely on the store being a rigid cache of everything elsewhere without refetching.
    if (query.data) setProjects(query.data);
  }, [query.data, setProjects]);

  return query;
};

// Hook to fetch a single Project by ID
export const useProject = (id: string) => {
  return useQuery<Project | null, Error>({
    queryKey: ["project", id],
    queryFn: () => fetchProjectById(id),
    enabled: !!id,
  });
};

// Hook to create a new project and update the store
export const useCreateProject = (onSuccess?: (project: Project) => void) => {
  const queryClient = useQueryClient();
  const addProject = useProjectStore((state) => state.addProject);
  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      toast.success("Project created successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      addProject(project);
      if (onSuccess) onSuccess(project); // Call the onSuccess callback if provided
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });
};

// Hook to update a project and update the store
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const updateProjectInStore = useProjectStore((state) => state.updateProject);
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (updatedProject) => {
      toast.success("Project updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      updateProjectInStore(updatedProject);
    },
    onError: () => {
      toast.error("Failed to update project");
    },
  });
};

// Hook to delete a project and update the store
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const deleteProjectFromStore = useProjectStore((state) => state.deleteProject);
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, variables) => {
      toast.success("Project deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // variables is the project id in our deleteProject function
      deleteProjectFromStore(variables);
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });
};

// new hook: update project actuals
export const useUpdateProjectActuals = () => {
  const queryClient = useQueryClient();
  const updateProjectInStore = useProjectStore((state) => state.updateProject);
  return useMutation({
    mutationFn: updateProjectActuals,
    onSuccess: (updatedProject) => {
      toast.success("Project actuals updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      updateProjectInStore(updatedProject);
    },
    onError: () => {
      toast.error("Failed to update project actuals");
    },
  });
};

export const useUpdateProjectProgress = () => {
  const queryClient = useQueryClient();
  const updateProjectInStore = useProjectStore((state) => state.updateProject);

  return useMutation({
    mutationFn: updateProjectProgress,
    onSuccess: (updatedProject) => {
      toast.success("Project progress updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", updatedProject.id] });
      updateProjectInStore(updatedProject);
    },
    onError: () => {
      toast.error("Failed to update project progress");
    },
  });
};
