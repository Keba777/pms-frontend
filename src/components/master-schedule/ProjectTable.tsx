import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Menu } from "@headlessui/react";

import { Project, UpdateProjectInput } from "@/types/project";
import { formatDate, getDateDuration } from "@/utils/helper";

import TaskTable from "./TaskTable";
import ProjectTableSkeleton from "./ProjectTableSkeleton";
import ConfirmModal from "../ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";

import { usePermissionsStore } from "@/store/permissionsStore";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { useTags } from "@/hooks/useTags";
import { Task } from "@/types/task";

interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
  isError?: boolean;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  isLoading = false,
  isError = false,
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(
    null
  );

  // Permissions
  const hasPermission = usePermissionsStore((state) => state.hasPermission);
  const canView = hasPermission("view projects");
  const canEdit = hasPermission("edit projects");
  const canDelete = hasPermission("delete projects");

  const { data: users } = useUsers();
  const { data: tags } = useTags();
  // Mutations
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // no-op, headlessui handles click outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = (projectId: string, tasks: Task[]) => {
    if (tasks.length > 0) {
      toast.error(
        "Cannot delete project with tasks. Please delete all tasks first."
      );
      return;
    }
    setSelectedProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProjectId) deleteProject(selectedProjectId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => {
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

  if (isLoading) return <ProjectTableSkeleton />;
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
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50 w-32">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length ? (
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
                      {getDateDuration(project.start_date, project.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <span className="badge bg-label-secondary">
                        {project.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2 relative w-32">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <div>
                          <Menu.Button className="flex items-center justify-between gap-1 px-3 py-1 bg-white text-cyan-700 border border-cyan-700 hover:bg-gray-100 rounded w-full">
                            <span>Actions</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                          </Menu.Button>
                        </div>

                        <Menu.Items className="absolute left-0 mt-2 w-full origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleView(project.id)}
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700 disabled:opacity-50"`}
                                  disabled={!canView}
                                >
                                  View
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setProjectToEdit({
                                      ...project,
                                      members: project.members?.map(
                                        (m) => m.id
                                      ),
                                    });
                                    setShowForm(true);
                                  }}
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700 disabled:opacity-50"`}
                                  disabled={!canEdit}
                                >
                                  Edit
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    handleDeleteClick(
                                      project.id,
                                      project.tasks || []
                                    )
                                  }
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-red-600 disabled:opacity-50"`}
                                  disabled={!canDelete}
                                >
                                  Delete
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Menu>

                      {showForm && projectToEdit && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60 backdrop-blur-sm overflow-auto">
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
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default ProjectTable;
