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

const createProject = async (data: CreateProjectInput): Promise<Project> => {
  const response = await apiClient.post<ApiResponse<Project>>("/projects", data);
  return response.data.data;
};

const updateProject = async (data: UpdateProjectInput): Promise<Project> => {
  const response = await apiClient.put<ApiResponse<Project>>(
    `/projects/${data.id}`,
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

// ----------------------------
// Updated React Query hooks
// ----------------------------

// Hook to fetch all Projects and update the store
export const useProjects = () => {
  const setProjects = useProjectStore((state) => state.setProjects);
  const query = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  useEffect(() => {
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
