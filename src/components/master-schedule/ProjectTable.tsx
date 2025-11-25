"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { Project, UpdateProjectInput } from "@/types/project";
import { formatDate, getDateDuration } from "@/utils/dateUtils";

import ProjectTableSkeleton from "./ProjectTableSkeleton";
import ConfirmModal from "../common/ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";
import ManageProjectForm from "../forms/ManageProjectForm";

import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { Task } from "@/types/task";
import SearchInput from "../common/ui/SearchInput";
import { useSettingsStore } from "@/store/settingsStore";

interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
  isError?: boolean;
}

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
  Canceled: "bg-red-100 text-red-800",
  Onhold: "bg-amber-100 text-amber-800",
  Completed: "bg-green-100 text-green-800",
};

const columnOptions: Record<string, string> = {
  no: "No",
  title: "PROJECTS",
  priority: "Priority",
  start_date: "Start Date",
  end_date: "End Date",
  duration: "Duration",
  remaining: "Remaining",
  status: "Status",
  action: "Action",
};

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  isLoading = false,
  isError = false,
}) => {
  const router = useRouter();
  const { useEthiopianDate } = useSettingsStore();

  const { data: users } = useUsers();
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "no",
    "title",
    "priority",
    "start_date",
    "end_date",
    "duration",
    "remaining",
    "status",
    "action",
  ]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  // Edit modal
  // Guarantee `id: string` exists in the state so it can be passed to forms that require it
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] =
    useState<UpdateProjectInput & { id: string } | null>(null);

  // Manage modal
  const [showManageForm, setShowManageForm] = useState(false);
  const [projectToManage, setProjectToManage] =
    useState<UpdateProjectInput & { id: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

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
    router.push(`/projects/${id}`);
  };

  const handleEditSubmit = (data: UpdateProjectInput) => {
    updateProject(data);
    setShowEditForm(false);
  };

  const handleManageSubmit = (data: UpdateProjectInput) => {
    // only progress is updated in Manage form
    updateProject(data);
    setShowManageForm(false);
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <ProjectTableSkeleton />;
  if (isError) return <div>Error loading projects</div>;

  return (
    <div>
      <style>
        {`
          .truncate-ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}
      </style>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>

      <div className="flex items-center justify-between mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
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

        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search projects..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-16 truncate-ellipsis">
                  No
                </th>
              )}
              {selectedColumns.includes("title") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white min-w-[200px]">
                  PROJECTS
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-24 truncate-ellipsis">
                  Priority
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-28 truncate-ellipsis">
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-28 truncate-ellipsis">
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-24 truncate-ellipsis">
                  Duration
                </th>
              )}
              {selectedColumns.includes("remaining") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-24 truncate-ellipsis">
                  Remaining
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-28 truncate-ellipsis">
                  Status
                </th>
              )}
              {selectedColumns.includes("action") && (
                <th className="px-5 py-3 text-left text-sm font-medium text-white w-32 truncate-ellipsis">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, idx) => {
                const remaining = getDateDuration(
                  new Date().toISOString(),
                  project.end_date
                );
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("no") && (
                      <td className="px-5 py-2 w-16 truncate-ellipsis">
                        {idx + 1}
                      </td>
                    )}
                    {selectedColumns.includes("title") && (
                      <td className="px-5 py-2 font-medium text-blue-600 hover:underline min-w-[200px]">
                        <Link href={`/master-schedule/project/${project.id}`}>
                          {project.title}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("priority") && (
                      <td className="px-5 py-2 w-24 truncate-ellipsis">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            priorityBadgeClasses[project.priority]
                          }`}
                        >
                          {project.priority}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="px-5 py-2 w-28 truncate-ellipsis">
                        {formatDate(project.start_date, useEthiopianDate)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="px-5 py-2 w-28 truncate-ellipsis">
                        {formatDate(project.end_date, useEthiopianDate)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="px-5 py-2 w-24 truncate-ellipsis">
                        {getDateDuration(project.start_date, project.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="px-5 py-2 w-24 truncate-ellipsis">
                        {remaining}
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="px-5 py-2 w-28 truncate-ellipsis">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            statusBadgeClasses[project.status]
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("action") && (
                      <td className="px-5 py-2 w-32">
                        <Menu
                          as="div"
                          className="relative inline-block text-left"
                        >
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 w-full">
                            Action <ChevronDown className="w-4 h-4" />
                          </MenuButton>
                          <MenuItems className="absolute left-0 mt-2 w-40 bg-white border divide-y divide-gray-100 rounded-md shadow-lg z-50">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleView(project.id)}
                                  className={`w-full text-left px-3 py-2 text-sm ${
                                    active ? "bg-gray-100" : ""
                                  }`}
                                >
                                  View
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setProjectToEdit({
                                      ...project,
                                      members: project.members?.map(
                                        (m) => m.id
                                      ),
                                    } as UpdateProjectInput & { id: string });
                                    setShowEditForm(true);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm ${
                                    active ? "bg-gray-100" : ""
                                  }`}
                                >
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() =>
                                    handleDeleteClick(
                                      project.id,
                                      project.tasks || []
                                    )
                                  }
                                  className={`w-full text-left px-3 py-2 text-sm text-red-600 ${
                                    active ? "bg-gray-100" : ""
                                  }`}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setProjectToManage({
                                      ...project,
                                      members: project.members?.map(
                                        (m) => m.id
                                      ),
                                    } as UpdateProjectInput & { id: string });
                                    setShowManageForm(true);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm ${
                                    active ? "bg-gray-100" : ""
                                  }`}
                                >
                                  Manage
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-5 py-4 text-center text-gray-500"
                >
                  No projects match “{searchTerm}”
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
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Edit Project Modal */}
      {showEditForm && projectToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditProjectForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              project={projectToEdit}
              users={users}
            />
          </div>
        </div>
      )}

      {/* Manage Progress Modal */}
      {showManageForm && projectToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageProjectForm
              onClose={() => setShowManageForm(false)}
              project={projectToManage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTable;
