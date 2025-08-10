"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateTodoInput } from "@/types/todo";
import { useCreateTodo } from "@/hooks/useTodos";
import { useTodoStore } from "@/store/todoStore";
import { formatDate } from "@/utils/helper";
import { ArrowRight, Calendar } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { Role, User } from "@/types/user";
import { useRoles } from "@/hooks/useRoles";
import { useAuthStore } from "@/store/authStore";

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTodoInput>({
    defaultValues: {
      departmentId,
      status: "Not Started",
      progress: 0,
    },
  });

  const { mutate: createTodo, isPending } = useCreateTodo();
  // Retrieve todos from the store to show the last created todo
  const { todos } = useTodoStore();
  const lastTodo = todos && todos.length > 0 ? todos[todos.length - 1] : null;
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const { data: roles } = useRoles();

  const [duration, setDuration] = useState<string>("");

  const targetDate = watch("target");
  const dueDate = watch("dueDate");

  useEffect(() => {
    if (targetDate && dueDate) {
      const diffTime =
        new Date(dueDate).getTime() - new Date(targetDate).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  }, [targetDate, dueDate]);

  // When the user types in the duration field, update the dueDate automatically.
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    // If a valid target date exists and duration is a valid number, update the dueDate.
    if (targetDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedDueDate = new Date(targetDate);
      calculatedDueDate.setDate(
        calculatedDueDate.getDate() + Number(newDuration)
      );
      setValue("dueDate", calculatedDueDate);
    }
  };

  const onSubmit = (data: CreateTodoInput) => {
    const submitData = { ...data, departmentId };
    console.log("Submitting todo:", submitData);

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
        alert("Failed to create todo: " + error.message);
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
      {/* Header */}
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
        {/* Task Name */}
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

        {/* Type */}
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

        {/* Status and Priority Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
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
          {/* Status */}
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

        {/* Progress */}
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

        {/* Latest Todo History Card */}
        <div className="p-4 rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">
          <h4 className="text-lg font-semibold mb-2">Latest Todo</h4>
          {lastTodo ? (
            <div>
              <p className="font-medium flex items-center">
                <Calendar size={16} className="mr-2" />
                {lastTodo.task}
              </p>
              <div className="flex items-center text-sm mt-1">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(lastTodo.target)}</span>
                <ArrowRight size={16} className="mx-2" />
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(lastTodo.dueDate)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm">No todo history available</p>
          )}
        </div>

        {/* Dates Section with Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="target"
              control={control}
              rules={{ required: "Target date is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.target && (
              <p className="text-red-500 text-sm mt-1">
                {errors.target.message}
              </p>
            )}
          </div>

          {/* Duration Field (Optional - Not Submitted) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days) <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={handleDurationChange}
              placeholder="Enter duration in days"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dueDate"
              control={control}
              rules={{ required: "Due date is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date);
                    if (targetDate && date) {
                      const diffTime =
                        new Date(date).getTime() -
                        new Date(targetDate).getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      setDuration(diffDays.toString());
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        {/* AssignedUsers Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned to
          </label>
          <Controller
            name="assignedUsers"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={assignedUsersOptions}
                isLoading={usersLoading}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) =>
                  field.onChange(selectedOptions.map((option) => option.value))
                }
                value={assignedUsersOptions.filter(
                  (option: { value: string; label: string }) =>
                    field.value?.includes(option.value)
                )}
              />
            )}
          />
          {usersError && (
            <p className="text-red-500 text-sm mt-1">Error loading users</p>
          )}
        </div>

        {/* Remark */}
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

        {/* Remainder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder
          </label>
          <input
            type="text"
            {...register("remainder")}
            placeholder="Enter Reminder"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div>

        {/* Attachment - Simple file input, but handling upload is not implemented here */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <input
            type="file"
            multiple
            {...register("attachment")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload files (handling upload to get URLs would require additional
            logic)
          </p>
        </div>

        {/* Footer Buttons */}
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
