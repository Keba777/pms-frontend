"use client";

import React, { useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useProjects } from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/hooks/useUsers";
import ConfirmModal from "../ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";
import { Project } from "@/types/project";

// Component to display a single member's name using the useUser hook
const MemberDisplay: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user, isLoading, isError } = useUser(userId);

  if (isLoading) return <span>Loading...</span>;
  if (isError || !user) return <span>Error</span>;

  return <span>{user.first_name}</span>;
};

const ProjectSection = () => {
  const { data: projects, isLoading, isError } = useProjects();
  const router = useRouter();

  const formatDate = (date: string | number | Date) => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString("en-GB");
  };

  // State for edit and delete modals
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [, setSelectedProjectId] = useState<string | null>(null);

  // Handlers for actions
  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowEditForm(true);
  };

  const handleDeleteProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = () => {
    // Insert your delete functionality here. For example:
    // deleteProject(selectedProjectId);
    setIsDeleteModalOpen(false);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading projects</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>

      {/* Edit Project Modal */}
      {showEditForm && projectToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditProjectForm
              onClose={() => setShowEditForm(false)}
              project={projectToEdit}
              onSubmit={() => {}}
              tags={undefined}
              users={undefined}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Project
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Assigned To
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Clients
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Priority
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Progress
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Starts At
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Ends At
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects?.length ? (
              projects.map((project, index) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 text-start px-4 py-2 font-medium text-bs-primary">
                    <Link href={`projects/${project.id}`}>{project.title}</Link>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {project.members && project.members.length
                      ? project.members.map((memberId, idx) => (
                          <span key={memberId}>
                            <MemberDisplay userId={memberId} />
                            {project.members &&
                              idx < project.members.length - 1 &&
                              ", "}
                          </span>
                        ))
                      : "N/A"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {project.client}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {project.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {project.priority}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {project.progress || 0}%
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {formatDate(project.start_date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {formatDate(project.end_date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="relative inline-block">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleEditProject(project)}
                              >
                                <FaEdit className="inline mr-2" /> Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
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
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleViewProject(project.id)}
                              >
                                <FaEye className="inline mr-2" /> Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="border border-gray-200 px-4 py-2 text-center"
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
    </div>
  );
};

export default ProjectSection;
