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
import { Input } from "@/components/ui/input";
import { getDateDuration, getDuration as calcRemaining } from "@/utils/helper";
import { formatDate as format } from "@/utils/dateUtils";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  searchTerm?: string;
  statusFilter?: string | null;
}

const TaskSection: React.FC<TaskSectionProps> = ({ searchTerm: globalSearch, statusFilter }) => {

  const router = useRouter();
  const { data: tasks, isLoading, isError } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { data: users } = useUsers();

  const columnOptions = [
    { value: "id", label: "ID" },
    { value: "task_name", label: "Task" },
    { value: "assignedUsers", label: "Assigned To" },
    { value: "priority", label: "Priority" },
    { value: "progress", label: "Progress" },
    { value: "start_date", label: "Starts At" },
    { value: "end_date", label: "Ends At" },
    { value: "duration", label: "Duration" },
    { value: "remaining", label: "Remaining" },
    { value: "status", label: "Status" },
    { value: "approvalStatus", label: "Approval" },
    { value: "actions", label: "Actions" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );


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

  const handleManageSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowManageForm(false);
  };

  // No early return for isLoading - we want to keep the title and filters visible.

  const isDataAvailable = !isLoading && tasks;
  const filtered =
    tasks?.filter((t) => {
      const matchesSearch =
        t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (globalSearch ? t.task_name.toLowerCase().includes(globalSearch.toLowerCase()) : true);

      const matchesStatus = statusFilter ? t.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    }) || [];

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedTasks = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Helper to render page numbers with ellipsis
  const renderPageNumbers = () => {
    const pages: React.ReactNode[] = [];
    const maxVisible = 5;
    const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setPage(1)}
            className="cursor-pointer"
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            className="cursor-pointer"
            isActive={page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setPage(totalPages)}
            className="cursor-pointer"
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-baseline gap-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          Available Tasks
        </h2>
        <span className="text-sm text-gray-400 font-medium">({filtered.length} total)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Customize Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 ">
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
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

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

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary/90">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead
                    key={col.value}
                    className="text-gray-50 font-medium  px-4 py-4"
                  >
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  {columnOptions
                    .filter((col) => selectedColumns.includes(col.value))
                    .map((col) => (
                      <TableCell key={col.value} className="px-4 py-2 text-center">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="text-center py-8 text-red-500"
                >
                  Error loading tasks.
                </TableCell>
              </TableRow>
            ) : paginatedTasks.length > 0 ? (
              paginatedTasks.map((task, idx) => {
                const duration = getDateDuration(
                  task.start_date,
                  task.end_date
                );
                const remaining =
                  task.end_date && new Date(task.end_date) > new Date()
                    ? calcRemaining(new Date(), task.end_date)
                    : "N/A";

                return (
                  <TableRow key={task.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("id") && (
                      <TableCell className="px-4 py-2 ">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>
                    )}
                    {selectedColumns.includes("task_name") && (
                      <TableCell className="px-4 py-2  font-medium text-primary">
                        <Link href={`/tasks/${task.id}`}>{task.task_name}</Link>
                      </TableCell>
                    )}
                    {selectedColumns.includes("assignedUsers") && (
                      <TableCell className="px-4 py-2">
                        {task.assignedUsers?.length ? (
                          <div className="flex -space-x-2">
                            {task.assignedUsers.map((u) => (
                              <ProfileAvatar key={u.id} user={u} />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </TableCell>
                    )}
                    {selectedColumns.includes("priority") && (
                      <TableCell className="px-4 py-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityBadgeClasses[task.priority]
                            }`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("progress") && (
                      <TableCell className="px-4 py-2 ">
                        {task.progress ?? 0}%
                      </TableCell>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <TableCell className="px-4 py-2 ">
                        {format(task.start_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <TableCell className="px-4 py-2 ">
                        {format(task.end_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("duration") && (
                      <TableCell className="px-4 py-2 ">{duration}</TableCell>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <TableCell className="px-4 py-2 ">{remaining}</TableCell>
                    )}
                    {selectedColumns.includes("status") && (
                      <TableCell className="px-4 py-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses[task.status]
                            }`}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("approvalStatus") && (
                      <TableCell className="px-4 py-2 ">
                        {task.approvalStatus}
                      </TableCell>
                    )}
                    {selectedColumns.includes("actions") && (
                      <TableCell className="px-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-primary-foreground p-0 bg-primary hover:bg-primary/90"
                            >
                              Action
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(task)}
                            >
                              <FaEdit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(task.id)}
                            >
                              <FaTrash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleView(task.id)}
                            >
                              <FaEye className="mr-2 h-4 w-4" /> Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleManageClick(task)}
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
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {renderPageNumbers()}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
    </div>
  );
};

export default TaskSection;
