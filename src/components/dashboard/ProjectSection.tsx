"use client";

import React, { useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useProjects } from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";
import { UpdateProjectInput } from "@/types/project";
import RoleName from "../common/RoleName";

const ProjectSection: React.FC = () => {
  const { data: projects, isLoading, isError } = useProjects();
  const router = useRouter();

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
  const [, setSelectedProjectId] = useState<string | null>(null);

  const handleEditProject = (proj: UpdateProjectInput) => {
    setProjectToEdit(proj);
    setShowEditForm(true);
  };

  const handleDeleteProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = () => {
    // TODO: call your delete mutation with the selected project ID
    setIsDeleteModalOpen(false);
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (isLoading) return <div>Loading projects…</div>;
  if (isError) return <div>Error loading projects.</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>

      {/* Edit Project Modal */}
      {showEditForm && projectToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditProjectForm
              project={projectToEdit}
              onSubmit={() => {}}
              onClose={() => setShowEditForm(false)}
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
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Project
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Assigned To
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Client
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Status
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Priority
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Progress
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Starts At
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Ends At
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 align-middle">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects && projects.length > 0 ? (
              projects.map((project, idx) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-left align-middle">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-cyan-700 hover:underline"
                    >
                      {project.title}
                    </Link>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {project.members && project.members.length > 0 ? (
                      <ul className="list-none space-y-1">
                        {project.members.map((member) => (
                          <li key={member.id}>
                            {member.first_name} {member.last_name} (
                            <RoleName roleId={member.role_id} />)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {project.client}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {project.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {project.priority}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {project.progress ?? 0}%
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {formatDate(project.start_date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    {formatDate(project.end_date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 align-middle">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                active ? "bg-blue-100" : ""
                              }`}
                              onClick={() =>
                                handleEditProject({
                                  ...project,
                                  members: project.members?.map((m) => m.id),
                                })
                              }
                            >
                              <FaEdit className="inline mr-2" /> Edit
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
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
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
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
