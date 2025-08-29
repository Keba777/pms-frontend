"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import {
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/hooks/useProjects";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../common/ui/ConfirmModal";
import EditProjectForm from "../forms/EditProjectForm";
import ManageProjectForm from "../forms/ManageProjectForm";
import { Project, UpdateProjectInput } from "@/types/project";
import { toast } from "react-toastify";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatDate,
  getDateDuration,
  getDuration as calcRemaining,
} from "@/utils/helper";
import { Input } from "@/components/ui/input";
import ProfileAvatar from "../common/ProfileAvatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  const columnOptions = [
    { value: "id", label: "ID" },
    { value: "title", label: "Project" },
    { value: "members", label: "Assigned To" },
    { value: "client", label: "Client" },
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
    { value: "progress", label: "Progress" },
    { value: "start_date", label: "Starts At" },
    { value: "end_date", label: "Ends At" },
    { value: "duration", label: "Duration" },
    { value: "remaining", label: "Remaining" },
    { value: "actions", label: "Actions" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

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

  if (isLoading)
    return (
      <div className="text-center py-8 text-gray-600">Loading projects...</div>
    );
  if (isError)
    return (
      <div className="text-center py-8 text-red-600">
        Error loading projects.
      </div>
    );

  const filtered =
    projects?.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
        Available Projects
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Customize Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              {columnOptions.map((col) => (
                <div key={col.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={col.value}
                    checked={selectedColumns.includes(col.value)}
                    onCheckedChange={() => toggleColumn(col.value)}
                  />
                  <label htmlFor={col.value} className="">
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-cyan-700 hover:bg-cyan-700">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead
                    key={col.value}
                    className="text-gray-50 font-medium  px-4 py-3"
                  >
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((project, idx) => {
                const remaining =
                  project.end_date && new Date(project.end_date) > new Date()
                    ? calcRemaining(new Date(), project.end_date)
                    : "N/A";
                return (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("id") && (
                      <TableCell className="px-4 py-3 ">{idx + 1}</TableCell>
                    )}
                    {selectedColumns.includes("title") && (
                      <TableCell className="px-4 py-3 ">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-cyan-700 hover:underline font-medium"
                        >
                          {project.title}
                        </Link>
                      </TableCell>
                    )}
                    {selectedColumns.includes("members") && (
                      <TableCell className="px-4 py-3">
                        {project.members?.length ? (
                          <div className="flex -space-x-2">
                            {project.members.map((m) => (
                              <ProfileAvatar key={m.id} user={m} />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {selectedColumns.includes("client") && (
                      <TableCell className="px-4 py-3 ">
                        {project.client}
                      </TableCell>
                    )}
                    {selectedColumns.includes("status") && (
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            statusBadgeClasses[project.status]
                          }`}
                        >
                          {project.status}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("priority") && (
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            priorityBadgeClasses[project.priority]
                          }`}
                        >
                          {project.priority}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("progress") && (
                      <TableCell className="px-4 py-3 ">
                        {project.progress ?? 0}%
                      </TableCell>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <TableCell className="px-4 py-3 ">
                        {formatDate(project.start_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <TableCell className="px-4 py-3 ">
                        {formatDate(project.end_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("duration") && (
                      <TableCell className="px-4 py-3 ">
                        {getDateDuration(project.start_date, project.end_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <TableCell className="px-4 py-3 ">{remaining}</TableCell>
                    )}
                    {selectedColumns.includes("actions") && (
                      <TableCell className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-white p-0 bg-cyan-700"
                            >
                              Action
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(project)}
                            >
                              <FaEdit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteProjectClick(project.id)
                              }
                            >
                              <FaTrash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewProject(project.id)}
                            >
                              <FaEye className="mr-2 h-4 w-4" /> Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleManageClick(project)}
                            >
                              <FaTasks className="mr-2 h-4 w-4" /> Manage
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="text-center py-8 text-gray-500"
                >
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <EditProjectForm
              project={projectToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
              users={users}

            />
          </div>
        </div>
      )}

      {showManageForm && projectToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
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
