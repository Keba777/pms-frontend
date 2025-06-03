// components/ActualTaskTable.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Task, UpdateTaskInput } from "@/types/task";
import EditTaskForm from "../forms/EditTaskForm";
import ManageTaskForm from "../forms/ManageTaskForm";
import ConfirmModal from "../ui/ConfirmModal";
import GenericDownloads, { Column } from "../common/GenericDownloads";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import Link from "next/link";
import { formatDate, getDateDuration } from "@/utils/helper";
import SearchInput from "../ui/SearchInput";

interface ActualTaskTableProps {
  tasks: Task[];
  projectId?: string;
}

const statusBadgeClasses: Record<Task["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

export default function ActualTaskTable({
  tasks,
  projectId,
}: ActualTaskTableProps) {
  const router = useRouter();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { data: users } = useUsers();
  console.log(projectId);

  // Edit & Manage modals state
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [taskToManage, setTaskToManage] = useState<UpdateTaskInput | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Per‑row dropdown
  const [dropdownTaskId, setDropdownTaskId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Column customization
  const columnOptions: Record<string, string> = {
    no: "No",
    task_name: "Task",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    remaining: "Remaining",
    budget: "Budget",
    progress: "Progress",
    status: "Status",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTasks = tasks.filter(
    (t) =>
      t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicks outside menus
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownTaskId(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Handlers
  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  const handleDeleteClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.activities?.length) {
      toast.error(
        "Cannot delete task with activities. Please delete all activities first."
      );
      return;
    }
    setSelectedTaskId(taskId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId, {
        onSuccess: () => toast.success("Task deleted"),
        onError: () => toast.error("Failed to delete"),
      });
    }
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => router.push(`/tasks/${id}`);

  const handleEditClick = (t: Task) => {
    setTaskToEdit({
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id),
    });
    setShowEditForm(true);
  };
  const handleEditSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowEditForm(false);
  };

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

  // Columns for downloads (budget always “0”)
  const downloadColumns: Column<Task>[] = [
    { header: "Task", accessor: "task_name" },
    {
      header: "Start Date",
      accessor: (row) => formatDate(row.start_date),
    },
    {
      header: "End Date",
      accessor: (row) => formatDate(row.end_date),
    },
    {
      header: "Duration",
      accessor: (row) => getDateDuration(row.start_date, row.end_date),
    },
    {
      header: "Remaining",
      accessor: (row) =>
        getDateDuration(new Date().toISOString(), row.end_date),
    },
    { header: "Budget", accessor: () => "0" },
    { header: "Progress", accessor: (row) => `${row.progress}%` },
    { header: "Status", accessor: "status" },
  ];

  return (
    <div className="ml-3 space-y-4">
      <GenericDownloads
        data={filteredTasks}
        title="Actual Tasks"
        columns={downloadColumns}
      />

      <div className="flex items-center justify-between">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow z-10">
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
        <SearchInput
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Edit Task Modal */}
      {showEditForm && taskToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditTaskForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              task={taskToEdit}
              users={users}
            />
          </div>
        </div>
      )}

      {/* Manage Task Modal */}
      {showManageForm && taskToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageTaskForm
              onClose={() => setShowManageForm(false)}
              onSubmit={handleManageSubmit}
              task={taskToManage}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-teal-700">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-16">
                  No
                </th>
              )}
              {selectedColumns.includes("task_name") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Task
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Duration
                </th>
              )}
              {selectedColumns.includes("remaining") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Remaining
                </th>
              )}
              {selectedColumns.includes("budget") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Budget
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Progress
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Status
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, idx) => {
                const duration = getDateDuration(
                  task.start_date,
                  task.end_date
                );
                const remaining = getDateDuration(
                  new Date().toISOString(),
                  task.end_date
                );
                return (
                  <tr key={task.id} className="hover:bg-gray-50 relative">
                    {selectedColumns.includes("no") && (
                      <td className="border px-4 py-2">{idx + 1}</td>
                    )}
                    {selectedColumns.includes("task_name") && (
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        <Link href={`/master-schedule/task/${task.id}`}>
                          {task.task_name}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border px-4 py-2">
                        {formatDate(task.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border px-4 py-2">
                        {formatDate(task.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border px-4 py-2">{duration}</td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="border px-4 py-2">{remaining}</td>
                    )}
                    {selectedColumns.includes("budget") && (
                      <td className="border px-4 py-2">0</td>
                    )}
                    {selectedColumns.includes("progress") && (
                      <td className="border px-4 py-2">{task.progress}%</td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="border px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            statusBadgeClasses[task.status]
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("actions") && (
                      <td className="border px-4 py-2">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownTaskId(
                                dropdownTaskId === task.id ? null : task.id
                              );
                            }}
                            className="flex items-center justify-between gap-1 px-3 py-1 bg-teal-700 text-white rounded w-full"
                          >
                            Actions
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          {dropdownTaskId === task.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow-lg z-50"
                            >
                              <button
                                onClick={() => {
                                  setDropdownTaskId(null);
                                  handleView(task.id);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setDropdownTaskId(null);
                                  handleEditClick(task);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDropdownTaskId(null);
                                  handleDeleteClick(task.id);
                                }}
                                className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => {
                                  setDropdownTaskId(null);
                                  handleManageClick(task);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                Manage
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="border px-4 py-2 text-center text-gray-500"
                >
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
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
}
