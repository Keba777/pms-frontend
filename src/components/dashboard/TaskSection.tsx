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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getDateDuration, getDuration as calcRemaining } from "@/utils/helper";
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

const TaskSection: React.FC = () => {
  const router = useRouter();
  const { data: tasks, isLoading, isError } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();

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

  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  const formatDateLocal = (date: string | number | Date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString("en-GB");
  };

  // Edit/Delete modal state
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Manage modal state
  const [showManageForm, setShowManageForm] = useState(false);
  const [taskToManage, setTaskToManage] = useState<UpdateTaskInput | null>(
    null
  );

  const handleEditClick = (t: Task) => {
    setTaskToEdit({
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id),
    });
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
    setTaskToManage({
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id),
    });
    setShowManageForm(true);
  };
  const handleManageSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowManageForm(false);
  };

  if (isLoading)
    return (
      <div className="text-center py-8 text-gray-600">Loading tasks...</div>
    );
  if (isError)
    return (
      <div className="text-center py-8 text-red-600">Error loading tasks.</div>
    );

  const filtered =
    tasks?.filter(
      (t) =>
        t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
        Available Tasks
      </h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              onSubmit={handleManageSubmit}
              onClose={() => setShowManageForm(false)}
              task={taskToManage}
            />
          </div>
        </div>
      )}

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
              filtered.map((task, idx) => {
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
                      <TableCell className="px-4 py-3 ">{idx + 1}</TableCell>
                    )}
                    {selectedColumns.includes("task_name") && (
                      <TableCell className="px-4 py-3  font-medium text-cyan-700">
                        <Link href={`/tasks/${task.id}`}>{task.task_name}</Link>
                      </TableCell>
                    )}
                    {selectedColumns.includes("assignedUsers") && (
                      <TableCell className="px-4 py-3">
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
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            priorityBadgeClasses[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("progress") && (
                      <TableCell className="px-4 py-3 ">
                        {task.progress ?? 0}%
                      </TableCell>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <TableCell className="px-4 py-3 ">
                        {formatDateLocal(task.start_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <TableCell className="px-4 py-3 ">
                        {formatDateLocal(task.end_date)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("duration") && (
                      <TableCell className="px-4 py-3 ">{duration}</TableCell>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <TableCell className="px-4 py-3 ">{remaining}</TableCell>
                    )}
                    {selectedColumns.includes("status") && (
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            statusBadgeClasses[task.status]
                          }`}
                        >
                          {task.status}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("approvalStatus") && (
                      <TableCell className="px-4 py-3 ">
                        {task.approvalStatus}
                      </TableCell>
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
