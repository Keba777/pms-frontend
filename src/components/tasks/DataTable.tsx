"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { formatDate, getDuration } from "@/utils/helper";
import DataTableToolbar from "./DataTableToolbar";
import Filters from "@/components/common/Filters";
import GenericDownloads from "@/components/common/GenericDownloads";
import { Task, UpdateTaskInput } from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { usePermissionsStore } from "@/store/permissionsStore";
import EditTaskForm from "@/components/forms/EditTaskForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import RoleName from "../common/RoleName";

const DataTable = () => {
  const tasks = useTaskStore((state) => state.tasks) as Task[];
  const isLoading = !tasks;
  const error = !tasks ? "Error fetching tasks." : null;
  const [search, setSearch] = useState("");

  // badge class mappings for priority and status
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

  // States for handling update and delete modals.
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const router = useRouter();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();

  // Permission checks from the permissions store.
  const hasPermission = usePermissionsStore((state) => state.hasPermission);
  const canView = hasPermission("view tasks");
  const canUpdate = hasPermission("edit tasks");
  const canDelete = hasPermission("delete tasks");

  const onRefresh = () => {
    console.log("Fetch");
    // Optionally implement your refresh logic here
  };

  // Filter tasks based on the search value.
  const filteredTasks = tasks.filter((task) =>
    task.task_name.toLowerCase().includes(search.toLowerCase())
  );

  // Column definitions typed for Task.
  const columns = [
    { header: "Task", accessor: (task: Task) => task.task_name },
    { header: "Priority", accessor: (task: Task) => task.priority },
    {
      header: "Start Date",
      accessor: (task: Task) => formatDate(task.start_date),
    },
    { header: "End Date", accessor: (task: Task) => formatDate(task.end_date) },
    {
      header: "Duration",
      accessor: (task: Task) => getDuration(task.start_date, task.end_date),
    },
    { header: "Progress", accessor: (task: Task) => task.progress },
    { header: "Status", accessor: (task: Task) => task.status },
    { header: "Approval", accessor: (task: Task) => task.approvalStatus },
    { header: "Assigned To", accessor: (task: Task) => task.assignedUsers },
  ];

  // Handlers for task actions.
  const handleViewTask = (id: string) => {
    if (canView) {
      router.push(`/tasks/${id}`);
    } else {
      alert("You do not have permission to view tasks.");
    }
  };

  const handleUpdateTask = (task: UpdateTaskInput) => {
    if (canUpdate) {
      setTaskToEdit(task);
      setShowEditForm(true);
    } else {
      alert("You do not have permission to update tasks.");
    }
  };

  const handleDeleteTaskClick = (id: string) => {
    if (canDelete) {
      setSelectedTaskId(id);
      setIsDeleteModalOpen(true);
    } else {
      alert("You do not have permission to delete tasks.");
    }
  };

  const handleDeleteTask = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditTaskSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowEditForm(false);
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="mt-6">
        <Filters />
        <GenericDownloads<Task>
          data={filteredTasks}
          title="Task Report"
          columns={columns}
        />
      </div>
      <DataTableToolbar
        onRefresh={onRefresh}
        searchValue={search}
        onSearchChange={setSearch}
      />
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Task
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Assigned To
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Priority
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Start Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                End Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Duration
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Progress
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Approval
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks && filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-bs-primary hover:underline font-medium"
                    >
                      {task.task_name}
                    </Link>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {task.assignedUsers && task.assignedUsers.length > 0 ? (
                      <ul className="list-none space-y-1">
                        {task.assignedUsers.map((user) => (
                          <li key={user.id}>
                            {user.first_name} {user.last_name} (
                            <RoleName roleId={user.role_id} />)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        priorityBadgeClasses[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(task.start_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(task.end_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {getDuration(task.start_date, task.end_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="relative h-5 bg-gray-200 rounded">
                      <div
                        className="absolute h-full rounded bg-blue-600"
                        style={{ width: `${task.progress ?? 0}%` }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {task.progress ?? 0}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        statusBadgeClasses[task.status]
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {task.approvalStatus}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="relative inline-block">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  if (canUpdate) {
                                    handleUpdateTask({
                                      ...task,
                                      assignedUsers: task.assignedUsers?.map(
                                        (user) => user.id
                                      ),
                                    });
                                  } else {
                                    alert(
                                      "You do not have permission to update tasks."
                                    );
                                  }
                                }}
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "You do not have permission to update tasks"
                                    : ""
                                }
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  if (canDelete) {
                                    handleDeleteTaskClick(task.id);
                                  } else {
                                    alert(
                                      "You do not have permission to delete tasks."
                                    );
                                  }
                                }}
                                disabled={!canDelete}
                                title={
                                  !canDelete
                                    ? "You do not have permission to delete tasks"
                                    : ""
                                }
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  if (canView) {
                                    handleViewTask(task.id);
                                  } else {
                                    alert(
                                      "You do not have permission to view tasks."
                                    );
                                  }
                                }}
                                disabled={!canView}
                                title={
                                  !canView
                                    ? "You do not have permission to view tasks"
                                    : ""
                                }
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-2 text-center">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {filteredTasks.length} rows
          </span>
          <select className="rounded border-gray-300 text-sm">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            &lsaquo;
          </button>
          <button className="px-3 py-1 rounded border bg-gray-100">1</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            &rsaquo;
          </button>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditForm && taskToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditTaskForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditTaskSubmit}
              task={taskToEdit}
            />
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this task?"
          confirmText="DELETE"
          showInput={true}
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default DataTable;
