"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateTodoInput } from "@/types/todo";
import { User } from "@/types/user";

interface EditTodoFormProps {
  onSubmit: (data: UpdateTodoInput) => void;
  onClose: () => void;
  todo: UpdateTodoInput;
  users?: User[];
}

const EditTodoForm: React.FC<EditTodoFormProps> = ({
  onSubmit,
  onClose,
  todo,
  users,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateTodoInput>({
    defaultValues: todo,
  });

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

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.role?.name})`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Edit Todo</h3>
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
              Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
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
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
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

        {/* Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date
            </label>
            <Controller
              name="target"
              control={control}
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
                  onChange={(date) => field.onChange(date)}
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
                options={userOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) =>
                  field.onChange(selectedOptions.map((option) => option.value))
                }
                value={userOptions.filter(
                  (option: { value: string; label: string }) =>
                    field.value?.includes(option.value)
                )}
              />
            )}
          />
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
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remainder
          </label>
          <textarea
            {...register("remainder")}
            placeholder="Enter Remainder"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={3}
          />
        </div> */}

        {/* Attachment */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>
          <input
            type="file"
            multiple
            {...register("attachment")}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div> */}

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
          >
            Update
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditTodoForm;
