"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import {
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";
import { Project, UpdateProjectInput } from "@/types/project";
import RoleName from "../common/RoleName";
import { toast } from "react-toastify";
import { useUsers } from "@/hooks/useUsers";
import { useTags } from "@/hooks/useTags";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

// Badge class mappings for priority and status
const priorityBadgeClasses: Record<Project["priority"], string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusBadgeClasses: Record<Project["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const ProjectSection: React.FC = () => {
  const router = useRouter();
  const { data: projects, isLoading, isError } = useProjects();
  const { data: users } = useUsers();
  const { data: tags } = useTags();

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  // define all possible columns
  const columnOptions: Record<string, string> = {
    id: "ID",
    title: "Project",
    members: "Assigned To",
    client: "Client",
    status: "Status",
    priority: "Priority",
    progress: "Progress",
    start_date: "Starts At",
    end_date: "Ends At",
    actions: "Actions",
  };

  // which columns are currently selected / visible
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowColumnMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: string | number | Date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString("en-GB");
  };

  // State for edit and delete modals
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const handleEditProject = (proj: UpdateProjectInput) => {
    setProjectToEdit(proj);
    updateProject(proj);
    setShowEditForm(true);
  };

  const handleDeleteProjectClick = (projectId: string) => {
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

  const handleDeleteProject = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (isLoading) return <div>Loading projects…</div>;
  if (isError) return <div>Error loading projects.</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>

      {/* Columns button on left */}
      <div ref={menuRef} className="relative mb-4">
        <button
          onClick={() => setShowColumnMenu((prev) => !prev)}
          className="flex items-center gap-1 px-5 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Customize Columns <ChevronDown className="w-4 h-4" />
        </button>
        {showColumnMenu && (
          <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
            {Object.entries(columnOptions).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(key)}
                  onChange={() => toggleColumn(key)}
                  className="mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {showEditForm && projectToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
            <EditProjectForm
              project={projectToEdit}
              onSubmit={() => handleEditProject(projectToEdit)}
              onClose={() => setShowEditForm(false)}
              users={users}
              tags={tags}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("id") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.id}
                </th>
              )}
              {selectedColumns.includes("title") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.title}
                </th>
              )}
              {selectedColumns.includes("members") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.members}
                </th>
              )}
              {selectedColumns.includes("client") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.client}
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.status}
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.priority}
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.progress}
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.start_date}
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.end_date}
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.actions}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects && projects.length > 0 ? (
              projects.map((project, idx) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {idx + 1}
                    </td>
                  )}
                  {selectedColumns.includes("title") && (
                    <td className="border border-gray-200 px-4 py-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-cyan-700 hover:underline"
                      >
                        {project.title}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("members") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {project.members?.length ? (
                        <ul className="list-none space-y-1">
                          {project.members.map((m) => (
                            <li key={m.id}>
                              {m.first_name} {m.last_name} (
                              <RoleName roleId={m.role_id} />)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  )}
                  {selectedColumns.includes("client") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {project.client}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="border border-gray-200 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          statusBadgeClasses[project.status]
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("priority") && (
                    <td className="border border-gray-200 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          priorityBadgeClasses[project.priority]
                        }`}
                      >
                        {project.priority}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("progress") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {project.progress ?? 0}%
                    </td>
                  )}
                  {selectedColumns.includes("start_date") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(project.start_date)}
                    </td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(project.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="border border-gray-200 px-4 py-2">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  setProjectToEdit({
                                    ...project,
                                    members: project.members?.map((m) => m.id),
                                  });
                                  setShowEditForm(true);
                                }}
                              >
                                <FaEdit className="inline mr-2" /> Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                  handleDeleteProjectClick(project.id)
                                }
                              >
                                <FaTrash className="inline mr-2" /> Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleViewProject(project.id)}
                              >
                                <FaEye className="inline mr-2" /> Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this project?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
        />
      )}
    </div>
  );
};

export default ProjectSection;
