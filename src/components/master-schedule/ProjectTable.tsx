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

  const handleEditSubmit = (data: UpdateProjectInput | FormData) => {
    updateProject(data as any);
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
      <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-6 mt-10 border-b border-gray-100 pb-4">Available Projects</h2>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div ref={menuRef} className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-bold text-sm"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Visible Columns</span>
              </div>
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mr-3"
                  />
                  <span className="text-sm text-gray-700 font-bold">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search projects..."
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto">
          <thead className="bg-primary">
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
                      <td className="px-5 py-2 font-medium text-primary hover:underline min-w-[200px]">
                        <Link href={`/master-schedule/project/${project.id}`}>
                          {project.title}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("priority") && (
                      <td className="px-5 py-2 w-24 truncate-ellipsis">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[project.priority]
                            }`}
                        >
                          {project.priority}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="px-5 py-2 w-28 truncate-ellipsis">
                        {formatDate(project.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="px-5 py-2 w-28 truncate-ellipsis">
                        {formatDate(project.end_date)}
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
                          className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[project.status]
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
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 w-full">
                            Action <ChevronDown className="w-4 h-4" />
                          </MenuButton>
                          <MenuItems className="absolute left-0 mt-2 w-40 bg-white border divide-y divide-gray-100 rounded-md shadow-lg z-50">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleView(project.id)}
                                  className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
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
                                      existingAttachments: project.attachments,
                                      attachments: undefined,
                                    } as UpdateProjectInput & { id: string });
                                    setShowEditForm(true);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
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
                                  className={`w-full text-left px-3 py-2 text-sm text-red-600 ${active ? "bg-gray-100" : ""
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
                                      existingAttachments: project.attachments,
                                      attachments: undefined,
                                    } as UpdateProjectInput & { id: string });
                                    setShowManageForm(true);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
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
