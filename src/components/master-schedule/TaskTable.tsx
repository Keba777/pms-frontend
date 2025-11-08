"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Task, UpdateTaskInput, CreateTaskInput } from "@/types/task";
import TaskForm from "../forms/TaskForm";
import EditTaskForm from "../forms/EditTaskForm";
import ManageTaskForm from "../forms/ManageTaskForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import GenericDownloads, { Column } from "../common/GenericDownloads";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import Link from "next/link";
import { formatDate, getDateDuration } from "@/utils/helper";
import { FilterField, GenericFilter } from "../common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { useCreateTask } from "@/hooks/useTasks";

interface TaskTableProps {
  tasks: Task[];
  projectTitle?: string;
  projectId?: string;
}

// Define filter interface
interface TaskFilters {
  taskName?: string;
  status?: string;
  priority?: string;
}

const statusBadgeClasses: Record<Task["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const priorityBadgeClasses: Record<Task["priority"], string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

/**
 * Narrowed local type so we guarantee `id: string` when passing to forms
 * Use `any` for progressUpdates here to avoid importing ProgressUpdateItem.
 * Replace `any` with the real ProgressUpdateItem[] type if you want stricter typing.
 */
type UpdatableTaskWithId = UpdateTaskInput & {
  id: string;
  name?: string;
  progressUpdates?: any[] | null;
};

export default function TaskTable({ tasks, projectId }: TaskTableProps) {
  const router = useRouter();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { data: users } = useUsers();
  const { mutateAsync: createTaskAsync } = useCreateTask(() => {});

  // Modals & forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdatableTaskWithId | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [taskToManage, setTaskToManage] = useState<UpdatableTaskWithId | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Per-row dropdown
  const [dropdownTaskId, setDropdownTaskId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Columns customization
  const columnOptions: Record<string, string> = {
    no: "No",
    task_name: "Task",
    priority: "Priority",
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

  const [filters, setFilters] = useState<TaskFilters>({});
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

  // Filter configuration
  const filterFields: FilterField[] = [
    {
      name: "taskName",
      label: "Task Name",
      type: "text",
      placeholder: "Search by task name...",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: Object.keys(statusBadgeClasses).map((status) => ({
        label: status,
        value: status,
      })),
      placeholder: "Select status...",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: Object.keys(priorityBadgeClasses).map((priority) => ({
        label: priority,
        value: priority,
      })),
      placeholder: "Select priority...",
    },
  ];

  useEffect(() => {
    let result = [...tasks];

    if (filters.taskName) {
      result = result.filter((t) =>
        t.task_name
          .toLowerCase()
          .includes((filters.taskName ?? "").toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    setFilteredTasks(result);
  }, [filters, tasks]);

  // Close menus on outside click
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
    const payload: UpdatableTaskWithId = {
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id) as any,
      id: t.id,
      name: (t as any).name ?? undefined,
      progressUpdates: (t as any).progressUpdates ?? null,
    };
    setTaskToEdit(payload);
    setShowEditForm(true);
  };
  const handleEditSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowEditForm(false);
  };

  const handleManageClick = (t: Task) => {
    const payload: UpdatableTaskWithId = {
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id) as any,
      id: t.id,
      name: (t as any).name ?? undefined,
      progressUpdates: (t as any).progressUpdates ?? null,
    };
    setTaskToManage(payload);
    setShowManageForm(true);
  };
  const handleManageSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowManageForm(false);
  };

  // Prepare columns for download
  const downloadColumns: Column<Task>[] = [
    { header: "Task", accessor: "task_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date) },
    {
      header: "Duration",
      accessor: (row) => getDateDuration(row.start_date, row.end_date),
    },
    {
      header: "Remaining",
      accessor: (row) =>
        getDateDuration(new Date().toISOString(), row.end_date),
    },
    {
      header: "Budget (Random)",
      accessor: () => Math.floor(1000000 + Math.random() * 9000000).toString(),
    },
    { header: "Progress", accessor: (row) => `${row.progress}%` },
    { header: "Status", accessor: "status" },
  ];

  // Task import configuration
  const importColumns: ImportColumn<CreateTaskInput>[] = [
    { header: "Task", accessor: "task_name", type: "string" },
    { header: "Priority", accessor: "priority", type: "string" },
    { header: "Start Date", accessor: "start_date", type: "date" },
    { header: "End Date", accessor: "end_date", type: "date" },
    { header: "Progress", accessor: "progress", type: "number" },
    { header: "Status", accessor: "status", type: "string" },
  ];

  const requiredAccessors: (keyof CreateTaskInput)[] = [
    "task_name",
    "priority",
    "start_date",
    "end_date",
    "status",
  ];

  const handleTaskImport = async (data: CreateTaskInput[]) => {
    try {
      const validPriorities = ["Critical", "High", "Medium", "Low"];
      const validStatuses = [
        "Not Started",
        "Started",
        "InProgress",
        "Canceled",
        "Onhold",
        "Completed",
      ];

      for (let i = 0; i < data.length; i++) {
        const task = data[i];
        if (!validPriorities.includes(task.priority)) {
          toast.error(
            `Invalid priority in row ${
              i + 2
            }. Must be one of: ${validPriorities.join(", ")}`
          );
          return;
        }
        if (!validStatuses.includes(task.status)) {
          toast.error(
            `Invalid status in row ${
              i + 2
            }. Must be one of: ${validStatuses.join(", ")}`
          );
          return;
        }

        task.project_id = projectId!;
        task.description = task.description || "Imported task";
      }

      await Promise.all(data.map((task) => createTaskAsync(task)));
      toast.success("Tasks imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating tasks");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="ml-3 space-y-4">
      <style>
        {`
          .truncate-ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}
      </style>
      <div>
        <div className="flex justify-end mb-4">
          <GenericImport<CreateTaskInput>
            expectedColumns={importColumns}
            requiredAccessors={requiredAccessors}
            onImport={handleTaskImport}
            title="Tasks"
            onError={handleError}
          />
        </div>
        <GenericDownloads
          data={filteredTasks}
          title="Tasks"
          columns={downloadColumns}
        />
      </div>

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
        <GenericFilter
          fields={filterFields}
          onFilterChange={(values) => setFilters(values as TaskFilters)}
        />
      </div>

      {/* Modals */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TaskForm
              onClose={() => setShowCreateForm(false)}
              defaultProjectId={projectId}
            />
          </div>
        </div>
      )}
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
      {showManageForm && taskToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Removed onSubmit prop to match ManageTaskForm's prop types */}
            <ManageTaskForm onClose={() => setShowManageForm(false)} task={taskToManage} />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {projectId ? "Project Tasks" : "All Tasks"}
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
        >
          Create Task
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto">
          <thead className="bg-teal-700">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-16 truncate-ellipsis">
                  No
                </th>
              )}
              {selectedColumns.includes("task_name") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 min-w-[200px]">
                  Task
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-24 truncate-ellipsis">
                  Priority
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-28 truncate-ellipsis">
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-28 truncate-ellipsis">
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-24 truncate-ellipsis">
                  Duration
                </th>
              )}
              {selectedColumns.includes("remaining") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-24 truncate-ellipsis">
                  Remaining
                </th>
              )}
              {selectedColumns.includes("budget") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-24 truncate-ellipsis">
                  Budget
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-20 truncate-ellipsis">
                  Progress
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-28 truncate-ellipsis">
                  Status
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-50 w-32 truncate-ellipsis">
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
                const randomBudget = Math.floor(
                  1000000 + Math.random() * 9000000
                );
                return (
                  <tr key={task.id} className="hover:bg-gray-50 relative">
                    {selectedColumns.includes("no") && (
                      <td className="border px-4 py-2 w-16 truncate-ellipsis">
                        {idx + 1}
                      </td>
                    )}
                    {selectedColumns.includes("task_name") && (
                      <td className="border border-gray-200 px-4 py-2 font-medium min-w-[200px]">
                        <Link href={`/master-schedule/task/${task.id}`}>
                          {task.task_name}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("priority") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            priorityBadgeClasses[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
                        {formatDate(task.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
                        {formatDate(task.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {duration}
                      </td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {remaining}
                      </td>
                    )}
                    {selectedColumns.includes("budget") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {randomBudget}
                      </td>
                    )}
                    {selectedColumns.includes("progress") && (
                      <td className="border px-4 py-2 w-20 truncate-ellipsis">
                        {task.progress}%
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
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
                      <td className="border px-4 py-2 w-32">
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
