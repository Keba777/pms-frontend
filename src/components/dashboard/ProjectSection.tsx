"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import {
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";
import ManageProjectForm from "../forms/ManageProjectForm";
import { Project, UpdateProjectInput } from "@/types/project";
import RoleName from "../common/RoleName";
import { toast } from "react-toastify";
import { useUsers } from "@/hooks/useUsers";
import { useTags } from "@/hooks/useTags";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  formatDate,
  getDateDuration,
  getDuration as calcRemaining,
} from "@/utils/helper";
import SearchInput from "../ui/SearchInput";
import ProfileAvatar from "../common/ProfileAvatar";

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
    duration: "Duration",
    remaining: "Remaining",
    actions: "Actions",
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // Edit state
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(
    null
  );
  // Manage state
  const [showManageForm, setShowManageForm] = useState(false);
  const [projectToManage, setProjectToManage] =
    useState<UpdateProjectInput | null>(null);
  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

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

  const handleEditClick = (proj: Project) => {
    setProjectToEdit({
      ...proj,
      members: proj.members?.map((m) => m.id),
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: UpdateProjectInput) => {
    updateProject(data);
    setShowEditForm(false);
  };

  const handleManageClick = (proj: Project) => {
    setProjectToManage({
      ...proj,
      members: proj.members?.map((m) => m.id),
    });
    setShowManageForm(true);
  };

  const handleManageSubmit = (data: UpdateProjectInput) => {
    updateProject(data);
    setShowManageForm(false);
  };

  if (isLoading) return <div>Loading projects…</div>;
  if (isError) return <div>Error loading projects.</div>;

  const filtered = projects?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>

      <div ref={menuRef} className="relative mb-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-5 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          <SearchInput
            placeholder="Search Projects"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
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

      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {Object.keys(columnOptions).map((col) =>
                selectedColumns.includes(col) ? (
                  <th
                    key={col}
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50"
                  >
                    {columnOptions[col]}
                  </th>
                ) : null
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered && filtered.length > 0 ? (
              filtered.map((project, idx) => {
                const remaining =
                  project.end_date && new Date(project.end_date) > new Date()
                    ? calcRemaining(new Date(), project.end_date)
                    : "N/A";
                return (
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
                          <ul className="list-none space-x-1 flex">
                            {project.members.map((m) => (
                              <ProfileAvatar key={m.id} user={m} />
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
                    {selectedColumns.includes("duration") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {getDateDuration(project.start_date, project.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {remaining}
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
                                  onClick={() => handleEditClick(project)}
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
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left ${
                                    active ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => handleManageClick(project)}
                                >
                                  <FaTasks className="inline mr-2" /> Manage
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
                  className="px-4 py-2 text-center text-gray-500"
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
          onConfirm={handleDeleteProject}
        />
      )}

      {showEditForm && projectToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl m-4 max-h-[90vh] overflow-y-auto">
            <EditProjectForm
              project={projectToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
              users={users}
              tags={tags}
            />
          </div>
        </div>
      )}

      {showManageForm && projectToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
            <ManageProjectForm
              onSubmit={handleManageSubmit}
              onClose={() => setShowManageForm(false)}
              project={projectToManage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSection;
