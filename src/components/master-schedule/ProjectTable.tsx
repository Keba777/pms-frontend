"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { Project, UpdateProjectInput } from "@/types/project";
import { formatDate, getDateDuration } from "@/utils/helper";

import TaskTable from "./TaskTable";
import ProjectTableSkeleton from "./ProjectTableSkeleton";
import ConfirmModal from "../ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";

import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { useTags } from "@/hooks/useTags";
import { Task } from "@/types/task";

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

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  isLoading = false,
  isError = false,
}) => {
  const router = useRouter();

  // Global hooks
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: users } = useUsers();
  const { data: tags } = useTags();
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  // Delete/Edit state
  const [expandedProjectId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(
    null
  );

  // Column customization state
  const columnOptions: Record<string, string> = {
    no: "No",
    title: "PROJECTS",
    priority: "Priority",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    status: "Status",
    action: "Action",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // headlessui handles outside clicks
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
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
  const handleView = (id: string) => router.push(`/projects/${id}`);
  const handleEditSubmit = (data: UpdateProjectInput) => {
    updateProject(data);
    setShowForm(false);
  };
  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // Render
  if (isLoading) return <ProjectTableSkeleton />;
  if (isError) return <div>Error loading projects</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>

      {/* Customize Columns Button */}
      <div className="flex items-center justify-between mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.no}
                </th>
              )}
              {selectedColumns.includes("title") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.title}
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.priority}
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.start_date}
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.end_date}
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.duration}
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.status}
                </th>
              )}
              {selectedColumns.includes("action") && (
                <th className="border px-5 py-3 text-left text-sm font-medium text-gray-50 w-32">
                  {columnOptions.action}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length ? (
              projects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <tr className="hover:bg-gray-50">
                    {selectedColumns.includes("no") && (
                      <td className="border px-5 py-2">{index + 1}</td>
                    )}
                    {selectedColumns.includes("title") && (
                      <td className="border px-5 py-2 font-medium text-bs-primary">
                        <Link href={`/master-schedule/project/${project.id}`}>
                          {project.title}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("priority") && (
                      <td className="border px-5 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            priorityBadgeClasses[project.priority]
                          }`}
                        >
                          {" "}
                          {project.priority}{" "}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border px-5 py-2">
                        {formatDate(project.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border px-5 py-2">
                        {formatDate(project.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border px-5 py-2">
                        {getDateDuration(project.start_date, project.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="border px-5 py-2">
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
                      <td className="border px-5 py-2 relative w-32">
                        <Menu
                          as="div"
                          className="relative inline-block text-left"
                        >
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                            Action <ChevronDown className="w-4 h-4" />
                          </MenuButton>
                          <MenuItems className="absolute left-0 mt-2 w-full origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleView(project.id)}
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700`}
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
                                    });
                                    setShowForm(true);
                                  }}
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700`}
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
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-red-600`}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`${
                                    active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700`}
                                  onClick={() => console.log("Manage clicked")}
                                >
                                  Manage
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
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
                    )}
                  </tr>
                  {expandedProjectId === project.id && (
                    <tr>
                      <td
                        colSpan={selectedColumns.length}
                        className="border px-5 py-2 bg-gray-50"
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
                  colSpan={selectedColumns.length}
                  className="border px-5 py-2 text-center"
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
          showInput={false}
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
