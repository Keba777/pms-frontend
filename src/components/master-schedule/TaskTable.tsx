"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import ActivityTable from "./ActivityTable";
import { Task, UpdateTaskInput } from "@/types/task";
import TaskForm from "../forms/TaskForm";
import EditTaskForm from "../forms/EditTaskForm";
import ConfirmModal from "../ui/ConfirmModal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import Link from "next/link";
import { formatDate, getDateDuration } from "@/utils/helper";

interface TaskTableProps {
  tasks: Task[];
  projectTitle?: string;
  projectId?: string;
}

// Badge class mapping for task status
const statusBadgeClasses: Record<Task["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  projectTitle,
  projectId,
}) => {
  const [expandedTaskId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [dropdownTaskId, setDropdownTaskId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { data: users } = useUsers();

  // Column customization setup
  const columnOptions: Record<string, string> = {
    no: "No",
    task_name: "Task",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    progress: "Progress",
    status: "Status",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownTaskId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task?.activities && task.activities.length > 0) {
      toast.error(
        "Cannot delete task with activities. Please delete all activities first."
      );
      return;
    }
    setSelectedTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId, {
        onSuccess: () => toast.success("Task deleted successfully!"),
        onError: () => toast.error("Failed to delete task"),
      });
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/tasks/${id}`);
  };

  const handleEditSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowEditForm(false);
  };

  return (
    <div className="ml-3">
      {projectTitle && (
        <div className="bg-white py-2 rounded-lg flex items-center justify-between mb-4 px-4">
          <div className="font-bold text-xl text-teal-700">
            Project:
            <span className="font-semibold ml-1 text-bs-gray-dark">
              {projectTitle}
            </span>
          </div>
          <div className="font-bold text-xl text-teal-700">
            Total Tasks:
            <span className="font-semibold ml-1 text-bs-gray-dark">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
            }}
            className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 disabled:opacity-50"
          >
            Create Task
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <TaskForm
              onClose={() => setShowCreateForm(false)}
              defaultProjectId={projectId}
            />
          </div>
        </div>
      )}

      {showEditForm && taskToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditTaskForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              task={taskToEdit}
              users={users}
            />
          </div>
        </div>
      )}

      {/* Customize Columns Button */}
      <div className="flex items-center justify-between mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow z-10">
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
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-teal-700">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 w-16">
                  {columnOptions.no}
                </th>
              )}
              {selectedColumns.includes("task_name") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.task_name}
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.start_date}
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.end_date}
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.duration}
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.progress}
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                  {columnOptions.status}
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 w-32">
                  {columnOptions.actions}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.length ? (
              tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50 relative">
                    {selectedColumns.includes("no") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {index + 1}
                      </td>
                    )}
                    {selectedColumns.includes("task_name") && (
                      <td className="border border-gray-200 px-4 py-2 font-medium">
                        <Link href={`/master-schedule/task/${task.id}`}>
                          {task.task_name}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDate(task.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDate(task.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {getDateDuration(task.start_date, task.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("progress") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {task.progress}%
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="border border-gray-200 px-4 py-2">
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
                      <td className="border border-gray-200 px-4 py-2">
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
                            <span>Actions</span>
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
                                  setTaskToEdit({
                                    ...task,
                                    assignedUsers: task.assignedUsers?.map(
                                      (u) => u.id
                                    ),
                                  });
                                  setShowEditForm(true);
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
                                onClick={() => console.log("Manage clicked")}
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
                  {expandedTaskId === task.id && (
                    <tr>
                      <td
                        colSpan={selectedColumns.length}
                        className="border border-gray-200 px-4 py-2 bg-gray-50"
                      >
                        <ActivityTable taskId={task.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="border border-gray-200 px-4 py-2 text-center"
                >
                  No tasks found
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
          message="Are you sure you want to delete this task?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default TaskTable;
