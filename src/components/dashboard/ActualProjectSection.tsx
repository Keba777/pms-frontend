"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  useProjects,
  useDeleteProject,
  useUpdateProject,
  useUpdateProjectActuals,
} from "@/hooks/useProjects";
import { Project, ProjectActuals, UpdateProjectInput } from "@/types/project";
import { useUsers } from "@/hooks/useUsers";
import EditProjectForm from "../forms/EditProjectForm";
import ManageProjectForm from "../forms/ManageProjectForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import Link from "next/link";
import ProfileAvatar from "../common/ProfileAvatar";
import {
  formatDate,
  getDateDuration,
  getDuration as calcRemaining,
} from "@/utils/dateUtils";
import { toast } from "react-toastify";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ActualProjectSectionProps {
  externalFilters?: Record<string, any>;
}

const statusBadgeClasses: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const ActualProjectSection: React.FC<ActualProjectSectionProps> = ({ externalFilters }) => {
  const router = useRouter();
  const { data: projects, isLoading, isError } = useProjects();
  const { data: users } = useUsers();

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();
  const { mutateAsync: updateProjectActuals } = useUpdateProjectActuals();

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Edit/manage/delete modals state
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [projectToManage, setProjectToManage] = useState<UpdateProjectInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const defaultActuals: ProjectActuals = {
    start_date: null,
    end_date: null,
    progress: null,
    status: null,
    budget: null,
  };

  const extendedProjects = useMemo(() => {
    if (!projects) return [];

    return projects
      .filter((project) => {
        if (!externalFilters) return true;

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

        return matchesStatus && matchesPriority && matchesDateRange;
      })
      .map((project) => ({
        ...project,
        actuals: { ...defaultActuals, ...(project.actuals || {}) },
      }));
  }, [projects, externalFilters]);

  const handleDeleteProjectClick = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    if (project?.tasks && project.tasks.length > 0) {
      toast.error("Cannot delete project with tasks. Please delete all tasks first.");
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
    updateProject(data as any);
    setShowEditForm(false);
  };

  const handleManageClick = (proj: Project) => {
    setProjectToManage({
      ...proj,
      members: proj.members?.map((m) => m.id),
      existingAttachments: proj.attachments,
      attachments: undefined,
      budget: 0,
    });
    setShowManageForm(true);
  };

  const sanitizeProjectActualsForApi = (raw: any): ProjectActuals => {
    const safe = { ...(raw || {}) } as any;
    const toIso = (v: any) => {
      if (!v && v !== 0) return null;
      try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
      } catch {
        return null;
      }
    };
    safe.start_date = toIso(safe.start_date);
    safe.end_date = toIso(safe.end_date);
    const toNumberOrNull = (v: any) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    safe.progress = toNumberOrNull(safe.progress);
    safe.budget = toNumberOrNull(safe.budget);
    safe.status = safe.status ?? null;
    return safe as ProjectActuals;
  };

  const handleSaveActuals = async (projectsToUpdate: Project[]) => {
    try {
      await Promise.all(
        projectsToUpdate.map((p) => {
          const sanitized = sanitizeProjectActualsForApi(p.actuals);
          return updateProjectActuals({ id: p.id, actuals: sanitized });
        })
      );
      toast.success("Project actuals updated successfully");
    } catch (error) {
      console.error("Failed to update actuals:", error);
      toast.error("Failed to update project actuals");
    }
  };

  const columns: ColumnConfig<Project>[] = [
    {
      key: "id",
      label: "ID",
      render: (_, index) => index + 1,
    },
    {
      key: "title",
      label: "Project",
      render: (p) => (
        <Link href={`/projects/${p.id}`} className="text-primary hover:underline font-medium">
          {p.title}
        </Link>
      ),
    },
    {
      key: "members",
      label: "Assigned To",
      render: (p) => (
        <div className="flex -space-x-2">
          {p.members?.map((user) => (
            <ProfileAvatar key={user.id} user={user} />
          )) || "---"}
        </div>
      ),
    },
    {
      key: "client",
      label: "Client",
      render: (p) => p.clientInfo?.companyName || "---",
    },
    {
      key: "priority",
      label: "Priority",
    },
    {
      key: "actuals.budget",
      label: "Actual Budget",
      editable: true,
      inputType: "number",
      render: (p) => p.actuals?.budget ?? "---",
    },
    {
      key: "budget_diff",
      label: "Budget +/-",
      render: (p) => {
        const actual = Number(p.actuals?.budget || 0);
        const planned = Number(p.budget || 0);
        const diff = actual - planned;
        return diff !== 0 ? (diff > 0 ? `+${diff}` : diff) : "0";
      },
    },
    {
      key: "actuals.start_date",
      label: "Starts At",
      editable: true,
      inputType: "date",
      render: (p) => (p.actuals?.start_date ? formatDate(p.actuals.start_date) : "---"),
    },
    {
      key: "actuals.end_date",
      label: "Ends At",
      editable: true,
      inputType: "date",
      render: (p) => (p.actuals?.end_date ? formatDate(p.actuals.end_date) : "---"),
    },
    {
      key: "duration",
      label: "Duration",
      render: (p) => getDateDuration(p.actuals?.start_date, p.actuals?.end_date),
    },
    {
      key: "remaining",
      label: "Remaining",
      render: (p) => {
        const end = p.actuals?.end_date;
        if (end && new Date(end) > new Date()) {
          return calcRemaining(new Date(), end);
        }
        return "---";
      },
    },
    {
      key: "actuals.progress",
      label: "Progress",
      editable: true,
      inputType: "number",
      render: (p) => (
        <div className="relative h-6 w-full bg-gray-200 rounded overflow-hidden">
          <div
            className="absolute h-full bg-primary flex items-center justify-center text-[10px] text-white font-bold transition-all"
            style={{ width: `${p.actuals?.progress || 0}%` }}
          >
            {p.actuals?.progress || 0}%
          </div>
        </div>
      ),
    },
    {
      key: "actuals.status",
      label: "Status",
      editable: true,
      inputType: "select",
      options: [
        { label: "Not Started", value: "Not Started" },
        { label: "Started", value: "Started" },
        { label: "InProgress", value: "InProgress" },
        { label: "Canceled", value: "Canceled" },
        { label: "Onhold", value: "Onhold" },
        { label: "Completed", value: "Completed" },
      ],
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadgeClasses[p.actuals?.status || ""] || "bg-gray-100 text-gray-800"
            }`}
        >
          {p.actuals?.status || "---"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (p, _, { toggleEdit }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="bg-primary text-white hover:bg-primary/90 h-8 px-3 text-xs">
              Action <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleEdit()}>
              <FaEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/projects/${p.id}`)}>
              <FaEye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ReusableTable
        title="Actual Project Statistics"
        data={extendedProjects}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search projects..."
        isEditable={true}
        onSave={handleSaveActuals}
        onRowSave={async (p) => handleSaveActuals([p])}
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

      {showManageForm && projectToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageProjectForm onClose={() => setShowManageForm(false)} project={projectToManage as any} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActualProjectSection;
