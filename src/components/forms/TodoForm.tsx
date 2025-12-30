"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateTodoInput } from "@/types/todo";
import { useCreateTodo } from "@/hooks/useTodos";
import { useTodoStore } from "@/store/todoStore";
import { formatDate as format } from "@/utils/dateUtils";
import { Calendar } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { Role, User } from "@/types/user";
import { useRoles } from "@/hooks/useRoles";
import { useAuthStore } from "@/store/authStore";
import Select from "react-select";
import ReactDatePicker from "react-datepicker";

interface TodoFormProps {
  onClose: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onClose }) => {
  const { user } = useAuthStore();
  const departmentId = user!.department_id!;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTodoInput>({
    defaultValues: {
      departmentId,
      status: "Not Started",
      progress: 0,
    },
  });

  const { mutate: createTodo, isPending } = useCreateTodo();
  const { todos } = useTodoStore();
  const lastTodo = todos && todos.length > 0 ? todos[todos.length - 1] : null;
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const { data: roles } = useRoles();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const onSubmit = (data: CreateTodoInput) => {
    const submitData = { ...data, departmentId };

    if (
      !submitData.attachment ||
      Object.keys(submitData.attachment).length === 0
    ) {
      delete submitData.attachment;
    }

    createTodo(submitData, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create todo:", error);
      },
    });
  };

  const statusOptions = [
    {
      value: "Not Started",
      label: "Not Started",
      className: "bg-bs-dark-100 text-bs-dark",
    },
    {
      value: "In progress",
      label: "In Progress",
      className: "bg-bs-secondary-100 text-bs-secondary",
    },
    {
      value: "Pending",
      label: "Pending",
      className: "bg-bs-warning-100 text-bs-warning",
    },
    {
      value: "Completed",
      label: "Completed",
      className: "bg-bs-success-100 text-bs-success",
    },
  ];

  const priorityOptions = [
    {
      value: "Urgent",
      label: "Urgent",
      className: "bg-bs-danger-100 text-bs-danger",
    },
    { value: "High", label: "High", className: "bg-bs-info-100 text-bs-info" },
    {
      value: "Medium",
      label: "Medium",
      className: "bg-bs-dark-100 text-bs-dark",
    },
    {
      value: "Low",
      label: "Low",
      className: "bg-bs-warning-100 text-bs-warning",
    },
  ];

  const CLIENT_ROLE_ID = "aa192529-c692-458e-bf96-42b7d4782c3d";

  const assignedUsersOptions =
    users
      ?.filter((user: User) => user.role_id !== CLIENT_ROLE_ID)
      .map((user: User) => {
        const roleObj: Role | undefined = roles?.find(
          (r) => r.id === user.role_id
        );
        const roleName = roleObj ? roleObj.name : "No Role";
        return {
          value: user.id!,
          label: `${user.first_name} (${roleName})`,
        };
      }) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Create Todo</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("task", { required: "Task Name is required" })}
            placeholder="Enter Task Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.task && (
            <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("type", { required: "Type is required" })}
            placeholder="Enter Todo Type"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: "Priority is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={priorityOptions}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={priorityOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={statusOptions}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={statusOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Progress (%)
          </label>
          <input
            type="number"
            {...register("progress", {
              min: 0,
              max: 100,
            })}
            placeholder="Enter progress (0-100)"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.progress && (
            <p className="text-red-500 text-sm mt-1">
              Progress must be between 0 and 100
            </p>
          )}
        </div>

        <div className="p-4 rounded-lg shadow-md bg-linear-to-r from-cyan-500 to-cyan-700 text-white">
          <h4 className="text-lg font-semibold mb-2">Latest Todo</h4>
          {lastTodo ? (
            <div>
              <p className="font-medium flex items-center">
                <Calendar size={16} className="mr-2" />
                {lastTodo.task}
              </p>
              <div className="flex items-center text-sm mt-1">
                <Calendar size={16} className="mr-1" />
                <span>{format(lastTodo.target)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm">No todo history available</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date
            </label>
            <Controller
              name="target"
              control={control}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Target Date"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dueDate"
              control={control}
              rules={{ required: "Due date is required" }}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Due Date"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </>
              )}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned to
          </label>
          <p className="text-sm text-gray-500 mb-2">The first selected user will be designated as the team leader, with the remaining users as team members.</p>
          <Controller
            name="assignedUsers"
            control={control}
            render={({ field }) => {
              const selectedOptions = (field.value || []).map((val: string) =>
                assignedUsersOptions.find((opt: any) => opt.value === val)
              ).filter(Boolean);
              return (
                <>
                  <Select
                    isMulti
                    options={assignedUsersOptions}
                    isLoading={usersLoading}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={(selectedOptions) =>
                      field.onChange(selectedOptions.map((option) => option?.value))
                    }
                    value={selectedOptions}
                  />
                  {selectedOptions.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <span className="block font-medium text-gray-700 mb-1">Leader</span>
                        <div className="ml-2 text-gray-600">{selectedOptions[0]?.label}</div>
                      </div>
                      {selectedOptions.length > 1 && (
                        <div>
                          <span className="block font-medium text-gray-700 mb-1">Members</span>
                          <div className="ml-2 space-y-1 text-gray-600">
                            {selectedOptions.slice(1).map((opt: any, idx: number) => (
                              <div key={idx}>{opt.label}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            }}
          />
          {usersError && (
            <p className="text-red-500 text-sm mt-1">Error loading users</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remark
          </label>
          <textarea
            {...register("remark")}
            placeholder="Enter Remark"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={3}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach Files
          </label>
          <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:border-bs-primary transition-colors duration-300">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-bs-primary file:text-white
                     hover:file:bg-bs-primary/90"
            />
            <p className="mt-2 text-sm text-gray-500">
              You can select multiple files.
            </p>
          </div>
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Files Selected:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TodoForm;
