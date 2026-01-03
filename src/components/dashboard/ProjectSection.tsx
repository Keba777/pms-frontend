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
  formatDate as format,
  getDateDuration,
  getDuration as calcRemaining,
} from "@/utils/dateUtils"; // Updated import
import ProfileAvatar from "../common/ProfileAvatar";
import { ProgressUpdateItem } from "@/types/activity";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";

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

interface ProjectSectionProps {
  externalFilters?: Record<string, any>;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ externalFilters }) => {
  const router = useRouter();
  const { data: projects, isLoading, isError } = useProjects();
  const { data: users } = useUsers();

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();

  const [searchTerm, setSearchTerm] = useState<string>("");

  // ... (rest of the state)
  // Edit state
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(
    null
  );
  // Manage state
  const [showManageForm, setShowManageForm] = useState(false);
  const [projectToManage, setProjectToManage] = useState<
    | (UpdateProjectInput & {
      id: string;
      name?: string;
      progressUpdates?: ProgressUpdateItem[] | null;
    })
    | null
  >(null);
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
      existingAttachments: proj.attachments,
      attachments: undefined,
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: UpdateProjectInput | FormData) => {
    updateProject(data);
    setShowEditForm(false);
  };

  const handleManageClick = (proj: Project) => {
    if (!proj.id) return;
    setProjectToManage({
      ...proj,
      id: proj.id,
      members: proj.members?.map((m) => m.id),
      name: proj.title,
      progressUpdates: proj.progressUpdates,
      existingAttachments: proj.attachments,
      attachments: undefined,
    });
    setShowManageForm(true);
  };

  const filtered =
    projects?.filter((project) => {
      // Local search
      const matchesSearch =
        !searchTerm ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.clientInfo?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectSite?.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!externalFilters) return matchesSearch;

      // External filters
      const matchesStatus =
        !externalFilters.status ||
        externalFilters.status.length === 0 ||
        externalFilters.status.includes(project.status);

      const matchesPriority =
        !externalFilters.priority ||
        externalFilters.priority.length === 0 ||
        externalFilters.priority.includes(project.priority);

      const matchesDateRange = (() => {
        if (!externalFilters.dateRange?.from) return true;
        const projStart = new Date(project.start_date);
        const projEnd = new Date(project.end_date);
        const filterStart = new Date(externalFilters.dateRange.from);
        const filterEnd = externalFilters.dateRange.to
          ? new Date(externalFilters.dateRange.to)
          : filterStart;

        return projStart <= filterEnd && projEnd >= filterStart;
      })();

      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    }) || [];

  const columns: ColumnConfig<Project>[] = [
    {
      key: "id",
      label: "ID",
      render: (_, index) => index + 1,
    },
    {
      key: "title",
      label: "Project",
      render: (project) => (
        <Link
          href={`/projects/${project.id}`}
          className="text-primary hover:underline font-medium"
        >
          {project.title}
        </Link>
      ),
    },
    {
      key: "members",
      label: "Assigned To",
      render: (project) => (
        project.members?.length ? (
          <div className="flex -space-x-2">
            {project.members.map((m) => (
              <ProfileAvatar key={m.id} user={m} />
            ))}
          </div>
        ) : (
          <span className="text-gray-500">N/A</span>
        )
      ),
    },
    {
      key: "client",
      label: "Client",
      render: (project) => project.clientInfo?.companyName || "-",
    },
    {
      key: "site",
      label: "Site",
      render: (project) => project.projectSite?.name || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (project) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses[project.status]
            }`}
        >
          {project.status}
        </span>
      )
    },
    {
      key: "priority",
      label: "Priority",
      render: (project) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityBadgeClasses[project.priority]
            }`}
        >
          {project.priority}
        </span>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      render: (project) => `${project.progress ?? 0}%`,
    },
    {
      key: "start_date",
      label: "Starts At",
      render: (project) => format(project.start_date),
    },
    {
      key: "end_date",
      label: "Ends At",
      render: (project) => format(project.end_date),
    },
    {
      key: "duration",
      label: "Duration",
      render: (project) => getDateDuration(project.start_date, project.end_date),
    },
    {
      key: "remaining",
      label: "Remaining",
      render: (project) => (
        project.end_date && new Date(project.end_date) > new Date()
          ? calcRemaining(new Date(), project.end_date)
          : "N/A"
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-primary-foreground p-0 bg-primary hover:bg-primary/90 h-8 px-2"
            >
              Action
              <ChevronDown className="h-4 w-4 ml-1" />
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
      ),
    },
  ];

  return (
    <>
      <ReusableTable
        title="Available Projects"
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search projects..."
        emptyMessage="No projects found"
      />

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

      {showManageForm && projectToManage && projectToManage.id && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageProjectForm
              onClose={() => setShowManageForm(false)}
              project={projectToManage}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectSection;
