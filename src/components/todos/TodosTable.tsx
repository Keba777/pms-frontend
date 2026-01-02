import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import Link from "next/link";
import { Todo, UpdateTodoInput } from "@/types/todo";
import { Department } from "@/types/department";
import { useRouter } from "next/navigation";
import { useDeleteTodo, useUpdateTodo } from "@/hooks/useTodos";
import EditTodoForm from "../forms/EditTodoForm";
import { useUsers } from "@/hooks/useUsers";
import ConfirmModal from "../common/ui/ConfirmModal";
import ManageTodoForm from "../forms/ManageTodoForm";
import { formatDate as format } from "@/utils/dateUtils";

const priorityBadgeClasses: Record<Todo["priority"], string> = {
  Urgent: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusBadgeClasses: Record<Todo["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  "In progress": "bg-yellow-100 text-yellow-800",
  Pending: "bg-orange-100 text-orange-800",
  Completed: "bg-green-100 text-green-800",
};

interface TodosTableProps {
  filteredTodos: Todo[];
  selectedColumns: string[];
  departments: Department[];
}

const TodosTable: React.FC<TodosTableProps> = ({
  filteredTodos,
  selectedColumns,
  departments,
}) => {

  const router = useRouter();
  const { data: users } = useUsers();
  const { mutate: deleteTodo } = useDeleteTodo();
  const { mutate: updateTodo } = useUpdateTodo();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<UpdateTodoInput | null>(null);

  // Manage modal
  const [showManageForm, setShowManageForm] = useState(false);
  const [todoToManage, setTodoToManage] = useState<UpdateTodoInput | null>(
    null
  );

  const handleDeleteClick = (todoId: string) => {
    setSelectedTodoId(todoId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedTodoId) deleteTodo(selectedTodoId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => {
    router.push(`/todos/${id}`);
  };

  const handleEditSubmit = (data: UpdateTodoInput) => {
    updateTodo(data);
    setShowEditForm(false);
  };

  const handleManageClick = (t: Todo) => {
    setTodoToManage({
      ...t,
      existingAttachments: t.attachment,
      attachment: undefined,
      assignedUsers: t.assignedUsers?.map((u) => u.id),
    });
    setShowManageForm(true);
  };
  const handleManageSubmit = (data: UpdateTodoInput) => {
    updateTodo(data);
    setShowManageForm(false);
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[1400px] divide-y divide-gray-200 border border-gray-200 table-auto">
        <thead className="bg-cyan-700">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
              #
            </th>
            {selectedColumns.includes("task") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Task
              </th>
            )}
            {selectedColumns.includes("type") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Type
              </th>
            )}
            {selectedColumns.includes("priority") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Priority
              </th>
            )}
            {selectedColumns.includes("assignedBy") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Assigned By
              </th>
            )}
            {selectedColumns.includes("assignedUsers") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Assigned To
              </th>
            )}
            {selectedColumns.includes("target_date") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Target Date
              </th>
            )}
            {selectedColumns.includes("target") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Target List
              </th>
            )}
            {selectedColumns.includes("givenDate") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Given Date
              </th>
            )}
            {selectedColumns.includes("dueDate") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Due Date
              </th>
            )}
            {/* {selectedColumns.includes("kpi") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                KPI
              </th>
            )} */}
            {selectedColumns.includes("department") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Department
              </th>
            )}
            {selectedColumns.includes("status") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Status
              </th>
            )}
            {selectedColumns.includes("progress") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Progress
              </th>
            )}
            {selectedColumns.includes("action") && (
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase whitespace-nowrap">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTodos.map((todo, idx) => (
            <tr key={todo.id}>
              <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                {idx + 1}
              </td>
              {selectedColumns.includes("task") && (
                <td className="px-4 py-2 text-bs-primary border border-gray-200 whitespace-nowrap">
                  <Link href={`/todos/${todo.id}`} className="hover:underline">
                    {todo.task}
                  </Link>
                </td>
              )}
              {selectedColumns.includes("type") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.type}
                </td>
              )}
              {selectedColumns.includes("priority") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[todo.priority]
                      }`}
                  >
                    {todo.priority || "-"}
                  </span>
                </td>
              )}
              {selectedColumns.includes("assignedBy") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {`${todo.assignedBy?.first_name} ${todo.assignedBy?.last_name}` || "-"}
                </td>
              )}
              {selectedColumns.includes("assignedUsers") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.assignedUsers?.length ? (
                    <ul className="list-none space-x-1 flex">
                      {todo.assignedUsers.map((m) => (
                        <ProfileAvatar key={m.id} user={m} />
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
              )}
              {selectedColumns.includes("target_date") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.target_date
                    ? format(todo.target_date)
                    : "-"}
                </td>
              )}
              {selectedColumns.includes("target") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.target && todo.target.length > 0 ? (
                    <ul className="list-disc list-inside text-xs">
                      {todo.target.slice(0, 2).map((t, i) => (
                        <li key={i} className="truncate max-w-[150px]" title={t}>{t}</li>
                      ))}
                      {todo.target.length > 2 && <li>+{todo.target.length - 2} more</li>}
                    </ul>
                  ) : "-"}
                </td>
              )}
              {selectedColumns.includes("givenDate") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.givenDate ? format(todo.givenDate) : "-"}
                </td>
              )}
              {selectedColumns.includes("dueDate") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.dueDate
                    ? format(todo.dueDate)
                    : "-"}
                </td>
              )}
              {/* {selectedColumns.includes("kpi") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.kpi?.score || todo.kpiId || "-"}
                </td>
              )} */}
              {selectedColumns.includes("department") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.department?.name ||
                    departments?.find((d) => d.id === todo.departmentId)
                      ?.name ||
                    "-"}
                </td>
              )}
              {selectedColumns.includes("status") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[todo.status]
                      }`}
                  >
                    {todo.status}
                  </span>
                </td>
              )}
              {selectedColumns.includes("progress") && (
                <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                  {todo.progress}
                </td>
              )}
              {selectedColumns.includes("action") && (
                <td className="px-4 py-2 border border-gray-200">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 w-full">
                      Action <ChevronDown className="w-4 h-4" />
                    </MenuButton>
                    <MenuItems className="absolute left-0 mt-2 w-40 bg-white border divide-y divide-gray-100 rounded-md shadow-lg z-50">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleView(todo.id)}
                            className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
                              }`}
                          >
                            View
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              setTodoToEdit({
                                ...todo,
                                existingAttachments: todo.attachment,
                                attachment: undefined,
                                assignedUsers: todo.assignedUsers?.map(
                                  (u) => u.id
                                ),
                              });
                              setShowEditForm(true);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
                              }`}
                          >
                            Edit
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => handleDeleteClick(todo.id)}
                            className={`w-full text-left px-3 py-2 text-sm text-red-600 ${active ? "bg-gray-100" : ""
                              }`}
                          >
                            Delete
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              handleManageClick(todo);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
                              }`}
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
          ))}
        </tbody>
      </table>

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this project?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Edit Todo Modal */}
      {showEditForm && todoToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditTodoForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              todo={todoToEdit}
              users={users}
            />
          </div>
        </div>
      )}

      {showManageForm && todoToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageTodoForm
              onClose={() => setShowManageForm(false)}
              onSubmit={handleManageSubmit}
              todo={todoToManage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TodosTable;
