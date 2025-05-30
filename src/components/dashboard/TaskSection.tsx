"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import { useTasks, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RoleName from "../common/RoleName";
import ConfirmModal from "../ui/ConfirmModal";
import EditTaskForm from "../forms/EditTaskForm";
import ManageTaskForm from "../forms/ManageTaskForm";
import { Task, UpdateTaskInput } from "@/types/task";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import SearchInput from "../ui/SearchInput";
import { getDateDuration, getDuration as calcRemaining } from "@/utils/helper";

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

  const columnOptions: Record<string, string> = {
    id: "ID",
    task_name: "Task",
    assignedUsers: "Assigned To",
    priority: "Priority",
    progress: "Progress",
    start_date: "Starts At",
    end_date: "Ends At",
    duration: "Duration",
    remaining: "Remaining",
    status: "Status",
    approvalStatus: "Approval",
    actions: "Actions",
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // toggle columns
  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  if (isLoading) return <div>Loading tasks…</div>;
  if (isError) return <div>Error loading tasks.</div>;

  // filter tasks by name or status
  const filtered = tasks?.filter(
    (t) =>
      t.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Tasks</h2>

      {/* Toolbar: customize + search */}
      <div ref={menuRef} className="relative mb-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
            className="flex items-center gap-1 px-5 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          <SearchInput
            placeholder="Search Tasks"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        {showColumnMenu && (
          <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
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
                {label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEditForm && taskToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl m-4 max-h-[90vh] overflow-y-auto">
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {Object.keys(columnOptions).map((col) =>
                selectedColumns.includes(col) ? (
                  <th
                    key={col}
                    className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50"
                  >
                    {columnOptions[col]}
                  </th>
                ) : null
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered && filtered.length > 0 ? (
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
                  <tr key={task.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("id") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {idx + 1}
                      </td>
                    )}
                    {selectedColumns.includes("task_name") && (
                      <td className="border border-gray-200 px-4 py-2 font-medium text-bs-primary">
                        <Link href={`/tasks/${task.id}`}>{task.task_name}</Link>
                      </td>
                    )}
                    {selectedColumns.includes("assignedUsers") && (
                      <td className="border border-gray-200 px-4 py-2">
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
                      <td className="border border-gray-200 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            priorityBadgeClasses[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("progress") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {task.progress ?? 0}%
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDateLocal(task.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {formatDateLocal(task.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {duration}
                      </td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {remaining}
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
                    {selectedColumns.includes("approvalStatus") && (
                      <td className="border border-gray-200 px-4 py-2">
                        {task.approvalStatus}
                      </td>
                    )}
                    {selectedColumns.includes("actions") && (
                      <td className="border border-gray-200 px-4 py-2">
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
                                  onClick={() => handleEditClick(task)}
                                >
                                  <FaEdit className="inline mr-2" /> Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left ${
                                    active ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => handleDeleteClick(task.id)}
                                >
                                  <FaTrash className="inline mr-2" /> Delete
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left ${
                                    active ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => handleView(task.id)}
                                >
                                  <FaEye className="inline mr-2" /> Quick View
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
                                  <FaTasks className="inline mr-2" /> Manage
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
