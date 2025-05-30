"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { formatDate, getDuration } from "@/utils/helper";
import GenericDownloads from "@/components/common/GenericDownloads";
import { Task, UpdateTaskInput } from "@/types/task";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import EditTaskForm from "@/components/forms/EditTaskForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import RoleName from "../common/RoleName";
import SearchInput from "../ui/SearchInput";
import ManageTaskForm from "../forms/ManageTaskForm";

const DataTable: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks) as Task[];
  const isLoading = !tasks;
  const error = !tasks ? "Error fetching tasks." : null;
  const [search, setSearch] = useState("");

  // badge class mappings
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

  // define columns for customization
  const columnOptions: Record<string, string> = {
    task_name: "Task",
    assignedUsers: "Assigned To",
    priority: "Priority",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    progress: "Progress",
    status: "Status",
    approvalStatus: "Approval",
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
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowColumnMenu(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // modal and action state
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [taskToManage, setTaskToManage] = useState<UpdateTaskInput | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const router = useRouter();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();

  const filteredTasks = tasks.filter((task) =>
    task.task_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewTask = (id: string) => {
    router.push(`/tasks/${id}`);
  };
  const handleUpdateTask = (task: UpdateTaskInput) => {
    setTaskToEdit(task);
    setShowEditForm(true);
  };
  const handleDeleteTaskClick = (id: string) => {
    setSelectedTaskId(id);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteTask = () => {
    if (selectedTaskId) deleteTask(selectedTaskId);
    setIsDeleteModalOpen(false);
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

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="mt-2 mb-6">
        <GenericDownloads<Task>
          data={filteredTasks}
          title="Task Report"
          columns={Object.entries(columnOptions)
            .filter(([k]) => selectedColumns.includes(k))
            .map(([key, label]) => ({
              header: label,
              accessor: key as keyof Task,
            }))}
        />
      </div>
      <div className="mb-5 flex items-center justify-between">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="mr-2"
                  />
                  {label || <span>&nbsp;</span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <SearchInput
          placeholder="Search tasks..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("task_name") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Task
                </th>
              )}
              {selectedColumns.includes("assignedUsers") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Assigned To
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Priority
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Duration
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Progress
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Status
                </th>
              )}
              {selectedColumns.includes("approvalStatus") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Approval
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("task_name") && (
                    <td className="px-4 py-2 font-medium text-bs-primary">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="hover:underline"
                      >
                        {task.task_name}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("assignedUsers") && (
                    <td className="px-4 py-2">
                      {task.assignedUsers?.length ? (
                        <ul className="list-none space-y-1">
                          {task.assignedUsers.map((u) => (
                            <li key={u.id}>
                              {u.first_name} {u.last_name} (
                              <RoleName roleId={u.role_id} />)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  )}
                  {selectedColumns.includes("priority") && (
                    <td className="px-4 py-2">
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
                    <td className="px-4 py-2">{formatDate(task.start_date)}</td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="px-4 py-2">{formatDate(task.end_date)}</td>
                  )}
                  {selectedColumns.includes("duration") && (
                    <td className="px-4 py-2">
                      {getDuration(task.start_date, task.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("progress") && (
                    <td className="px-4 py-2">
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
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          statusBadgeClasses[task.status]
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("approvalStatus") && (
                    <td className="px-4 py-2">{task.approvalStatus}</td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="px-4 py-2">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                  handleUpdateTask({
                                    ...task,
                                    assignedUsers: task.assignedUsers?.map(
                                      (u) => u.id
                                    ),
                                  })
                                }
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleDeleteTaskClick(task.id)}
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleViewTask(task.id)}
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleManageClick(task)}
                              >
                                Manage
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {showEditForm && taskToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditTaskForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              task={taskToEdit}
            />
          </div>
        </div>
      )}

      {/* Manage modal */}
      {showManageForm && taskToManage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
            <ManageTaskForm
              onSubmit={handleManageSubmit}
              onClose={() => setShowManageForm(false)}
              task={taskToManage}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this task?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default DataTable;
