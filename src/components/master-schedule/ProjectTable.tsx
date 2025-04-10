"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { Plus, ChevronDown } from "lucide-react";
import React from "react";
import TaskTable from "./TaskTable";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import ConfirmModal from "../ui/ConfirmModal";
import { toast } from "react-toastify";
import EditProjectForm from "../forms/EditProjectForm";
import { UpdateProjectInput } from "@/types/project";
import { useUsers } from "@/hooks/useUsers";
import { useTags } from "@/hooks/useTags";
import Link from "next/link";
import { formatDate } from "@/utils/helper";
import { usePermissionsStore } from "@/store/permissionsStore";

const ProjectTable = () => {
  const { data: projects, isLoading, isError } = useProjects();
  const { data: users } = useUsers();
  const { data: tags } = useTags();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [dropdownProjectId, setDropdownProjectId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get permission checking function from the permissions store.
  const hasPermission = usePermissionsStore((state) => state.hasPermission);
  // Determine specific permissions for this table.
  const canView = hasPermission("view projects");
  const canEdit = hasPermission("edit projects");
  const canDelete = hasPermission("delete projects");

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownProjectId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDuration = (
    start: Date | string | null | undefined,
    end: Date | string | null | undefined
  ): string => {
    if (!start || !end) return "N/A";
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      return "Invalid Date";

    let totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    const years = Math.floor(totalDays / 365);
    totalDays %= 365;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "Y" : "Ys"}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? "M" : "Ms"}`);
    if (days > 0 || parts.length === 0)
      parts.push(`${days} ${days === 1 ? "D" : "Ds"}`);
    return parts.join(", ");
  };

  const handleDeleteClick = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    if (project?.tasks && project.tasks.length > 0) {
      toast.error(
        "Cannot delete project with tasks. Please delete all tasks first."
      );
      return;
    }
    setSelectedProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => {
    // Check permission before viewing
    if (canView) {
      router.push(`/projects/${id}`);
    } else {
      toast.error("You do not have permission to view this project.");
    }
  };

  const handleEditSubmit = (data: UpdateProjectInput) => {
    updateProject(data);
    setShowForm(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading projects</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>
      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                No
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                PROJECTS
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Start Date
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                End Date
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Duration
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50 w-32">
                Action
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects?.length ? (
              projects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        <button
                          onClick={() =>
                            setExpandedProjectId(
                              expandedProjectId === project.id
                                ? null
                                : project.id
                            )
                          }
                          className="p-1 bg-cyan-700 text-gray-200 hover:text-cyan-700 hover:bg-gray-200 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2 font-medium text-bs-primary">
                      <Link href={`projects/${project.id}`}>
                        {project.title}
                      </Link>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {formatDate(project.start_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {formatDate(project.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {getDuration(project.start_date, project.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2 relative w-32">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownProjectId(
                            dropdownProjectId === project.id ? null : project.id
                          );
                        }}
                        className="flex items-center justify-between gap-1 px-3 py-1 bg-white text-cyan-700 border border-cyan-700 hover:bg-gray-100 rounded w-full"
                      >
                        <span>Actions</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </button>
                      {dropdownProjectId === project.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-0 mt-8 w-full bg-white border border-gray-200 rounded shadow-lg z-50"
                        >
                          <button
                            onClick={() => {
                              setDropdownProjectId(null);
                              handleView(project.id);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                            disabled={!canView}
                            title={!canView ? "You do not have permission to view projects" : ""}
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setDropdownProjectId(null);
                              setProjectToEdit(project);
                              setShowForm(true);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                            disabled={!canEdit}
                            title={!canEdit ? "You do not have permission to edit projects" : ""}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDropdownProjectId(null);
                              handleDeleteClick(project.id);
                            }}
                            className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 disabled:opacity-50"
                            disabled={!canDelete}
                            title={!canDelete ? "You do not have permission to delete projects" : ""}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {showForm && projectToEdit && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-6 backdrop-blur-xs overflow-auto">
                          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl m-4 mt-12 max-h-[90vh] overflow-y-auto">
                            <EditProjectForm
                              onClose={() => setShowForm(false)}
                              onSubmit={handleEditSubmit}
                              project={projectToEdit}
                              users={users}
                              tags={tags}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <span className="badge bg-label-secondary">
                        {project.status}
                      </span>
                    </td>
                  </tr>
                  {expandedProjectId === project.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-gray-200 pl-5 pr-7 py-2 bg-gray-50"
                      >
                        <TaskTable
                          tasks={project.tasks || []}
                          projectTitle={project.title}
                          projectId={project.id}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border border-gray-200 pl-5 pr-7 py-2 text-center"
                >
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this project?"
          showInput={true}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default ProjectTable;
