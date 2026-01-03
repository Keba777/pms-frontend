"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import { useTasks, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "../common/ui/ConfirmModal";
import EditTaskForm from "../forms/EditTaskForm";
import ManageTaskForm from "../forms/ManageTaskForm";
import { Task, UpdateTaskInput } from "@/types/task";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDateDuration, getDuration as calcRemaining } from "@/utils/helper";
import { formatDate as format } from "@/utils/dateUtils";
import ProfileAvatar from "../common/ProfileAvatar";
import { ReusableTable, ColumnConfig } from "../common/ReusableTable";
import { GenericFilter, FilterField } from "../common/GenericFilter";

/**
 * Narrowed local type so we can guarantee `id: string` when passing to forms
 */
type UpdatableTaskWithId = UpdateTaskInput & {
  id: string;
  name?: string;
  progressUpdates?: any[] | null;
};

const priorityBadgeClasses: Record<Task["priority"], string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};
const statusBadgeClasses: Record<Task["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

interface TaskSectionProps {
  externalFilters?: Record<string, any>;
}

const TaskSection: React.FC<TaskSectionProps> = ({ externalFilters }) => {
  const router = useRouter();
  const { data: tasks, isLoading, isError } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { data: users } = useUsers();

  const [searchTerm, setSearchTerm] = useState<string>("");

  // Edit/Delete modal state
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdatableTaskWithId | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Manage modal state
  const [showManageForm, setShowManageForm] = useState(false);
  const [taskToManage, setTaskToManage] = useState<UpdatableTaskWithId | null>(null);

  const handleEditClick = (t: Task) => {
    const payload: UpdatableTaskWithId = {
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id) as any,
      id: t.id,
      name: (t as any).name ?? undefined,
      progressUpdates: (t as any).progressUpdates ?? null,
      existingAttachments: (t as any).attachments,
      attachments: undefined,
    };
    setTaskToEdit(payload);
    setShowEditForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedTaskId(id);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedTaskId) deleteTask(selectedTaskId);
    setIsDeleteModalOpen(false);
  };
  const handleView = (id: string) => router.push(`/tasks/${id}`);

  const handleManageClick = (t: Task) => {
    const payload: UpdatableTaskWithId = {
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id) as any,
      id: t.id,
      name: (t as any).name ?? undefined,
      progressUpdates: (t as any).progressUpdates ?? null,
      existingAttachments: (t as any).attachments,
      attachments: undefined,
    };
    setTaskToManage(payload);
    setShowManageForm(true);
  };

  const filtered =
    tasks?.filter((t) => {
      if (!externalFilters) return true;

      // task_name search
      const matchesSearch =
        !externalFilters.task_name ||
        t.task_name.toLowerCase().includes(externalFilters.task_name.toLowerCase());

      // Advanced filters logic
      const matchesAdvancedStatus =
        !externalFilters.status ||
        externalFilters.status.length === 0 ||
        externalFilters.status.includes(t.status);

      const matchesAdvancedPriority =
        !externalFilters.priority ||
        externalFilters.priority.length === 0 ||
        externalFilters.priority.includes(t.priority);

      const matchesDateRange = (() => {
        if (!externalFilters.dateRange?.from) return true;
        const taskStart = new Date(t.start_date);
        const taskEnd = new Date(t.end_date);
        const filterStart = new Date(externalFilters.dateRange.from);
        const filterEnd = externalFilters.dateRange.to ? new Date(externalFilters.dateRange.to) : filterStart;

        // Task overlaps with filter range
        return (taskStart <= filterEnd && taskEnd >= filterStart);
      })();

      return matchesSearch && matchesAdvancedStatus && matchesAdvancedPriority && matchesDateRange;
    }) || [];

  const columns: ColumnConfig<Task>[] = [
    {
      key: "id",
      label: "ID",
      render: (_, index) => index + 1,
    },
    {
      key: "task_name",
      label: "Task",
      render: (task) => (
        <Link href={`/tasks/${task.id}`} className="font-medium text-primary hover:underline">
          {task.task_name}
        </Link>
      ),
    },
    {
      key: "assignedUsers",
      label: "Assigned To",
      render: (task) => (
        task.assignedUsers?.length ? (
          <div className="flex -space-x-2">
            {task.assignedUsers.map((u) => (
              <ProfileAvatar key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <span className="text-gray-500">N/A</span>
        )
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (task) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityBadgeClasses[task.priority]}`}>
          {task.priority}
        </span>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      render: (task) => `${task.progress ?? 0}%`,
    },
    {
      key: "start_date",
      label: "Starts At",
      render: (task) => format(task.start_date),
    },
    {
      key: "end_date",
      label: "Ends At",
      render: (task) => format(task.end_date),
    },
    {
      key: "duration",
      label: "Duration",
      render: (task) => getDateDuration(task.start_date, task.end_date),
    },
    {
      key: "remaining",
      label: "Remaining",
      render: (task) => (
        task.end_date && new Date(task.end_date) > new Date()
          ? calcRemaining(new Date(), task.end_date)
          : "N/A"
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (task) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses[task.status]}`}>
          {task.status}
        </span>
      ),
    },
    {
      key: "approvalStatus",
      label: "Approval",
    },
    {
      key: "actions",
      label: "Actions",
      render: (task) => (
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
            <DropdownMenuItem onClick={() => handleEditClick(task)}>
              <FaEdit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(task.id)}>
              <FaTrash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleView(task.id)}>
              <FaEye className="mr-2 h-4 w-4" /> Quick View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleManageClick(task)}>
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
        title="Available Tasks"
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search tasks..."
        emptyMessage="No tasks found"
      />

      {/* Edit modal */}
      {showEditForm && taskToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditTaskForm
              task={taskToEdit}
              onSubmit={(data) => {
                updateTask(data);
                setShowEditForm(false);
              }}
              users={users}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {/* Manage modal */}
      {showManageForm && taskToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageTaskForm
              onClose={() => setShowManageForm(false)}
              task={taskToManage}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this task?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default TaskSection;
