"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, ChevronDown } from "lucide-react";
import ActivityTable from "./ActivityTable";
import { Task, UpdateTaskInput } from "@/types/task";
import TaskForm from "../forms/TaskForm";
import EditTaskForm from "../forms/EditTaskForm";
import ConfirmModal from "../ui/ConfirmModal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";

interface TaskTableProps {
  tasks: Task[];
  projectTitle?: string;
  projectId?: string;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  projectTitle,
  projectId,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
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

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    const dd = dateObj.getDate().toString().padStart(2, "0");
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getDuration = (
    start: Date | string | null | undefined,
    end: Date | string | null | undefined
  ): string => {
    if (!start || !end) return "N/A";
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      return "Invalid Date";

    let totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    const years = Math.floor(totalDays / 365);
    totalDays %= 365;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "Y" : "Ys"}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? "M" : "Ms"}`);
    if (days > 0 || parts.length === 0)
      parts.push(`${days} ${days === 1 ? "D" : "Ds"}`);
    return parts.join(", ");
  };

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
        onSuccess: () => {
          toast.success("Task deleted successfully!");
        },
        onError: () => {
          toast.error("Failed to delete task");
        },
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
            Project:{" "}
            <span className="font-semibold ml-1 text-bs-gray-dark">
              {projectTitle}
            </span>
          </div>
          <div className="font-bold text-xl text-teal-700">
            Total Tasks:{" "}
            <span className="font-semibold ml-1 text-bs-gray-dark">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
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
              // Optionally, you can pass a users array for the "Assigned To" field:
              users={users}
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-teal-700">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 w-16">
                No
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Task
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Start Date
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                End Date
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Duration
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50 w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.length ? (
              tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50 relative">
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        <button
                          onClick={() =>
                            setExpandedTaskId(
                              expandedTaskId === task.id ? null : task.id
                            )
                          }
                          className="p-1 bg-teal-700 text-gray-200 hover:bg-gray-200 hover:text-teal-700 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      {task.task_name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(task.start_date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(task.end_date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {getDuration(task.start_date, task.end_date)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="badge bg-label-secondary">
                        {task.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownTaskId(
                              dropdownTaskId === task.id ? null : task.id
                            );
                          }}
                          className="flex items-center justify-between gap-1 px-3 py-1 bg-white text-teal-700 border border-teal-700 hover:bg-gray-100 rounded w-full"
                        >
                          <span>Actions</span>
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                        {dropdownTaskId === task.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50"
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
                                setTaskToEdit(task);
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
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedTaskId === task.id && (
                    <tr>
                      <td
                        colSpan={7}
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
                  colSpan={7}
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
          showInput={true}
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
