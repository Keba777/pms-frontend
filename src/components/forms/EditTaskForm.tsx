"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateTaskInput } from "@/types/task";
import { User } from "@/types/user";

interface EditTaskFormProps {
  onSubmit: (data: UpdateTaskInput) => void;
  onClose: () => void;
  task: UpdateTaskInput;
  users?: User[];
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  onSubmit,
  onClose,
  task,
  users,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateTaskInput>({
    defaultValues: task,
  });

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "Started", label: "Started" },
    { value: "InProgress", label: "In Progress" },
    { value: "Canceled", label: "Canceled" },
    { value: "Onhold", label: "Onhold" },
    { value: "Completed", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "Critical", label: "Critical" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const approvalOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Not Approved", label: "Not Approved" },
    { value: "Pending", label: "Pending" },
  ];

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Task</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Task Name */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Task Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("task_name", { required: "Task Name is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.task_name && (
        <p className="text-red-500 text-sm ml-32">{errors.task_name.message}</p>
      )}

      {/* Status */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Status<span className="text-red-500">*</span>
        </label>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={statusOptions}
              className="flex-1"
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
      {errors.status && (
        <p className="text-red-500 text-sm ml-32">{errors.status.message}</p>
      )}

      {/* Priority */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Priority
        </label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={priorityOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={priorityOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>

      {/* Approval Status */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Approval
        </label>
        <Controller
          name="approvalStatus"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={approvalOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={approvalOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>

      {/* Start Date */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Start Date<span className="text-red-500">*</span>
        </label>
        <Controller
          name="start_date"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              showYearDropdown
              scrollableYearDropdown
            />
          )}
        />
      </div>
      {errors.start_date && (
        <p className="text-red-500 text-sm ml-32">
          {errors.start_date.message}
        </p>
      )}

      {/* End Date */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          End Date<span className="text-red-500">*</span>
        </label>
        <Controller
          name="end_date"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              showYearDropdown
              scrollableYearDropdown
            />
          )}
        />
      </div>
      {errors.end_date && (
        <p className="text-red-500 text-sm ml-32">{errors.end_date.message}</p>
      )}

      {/* Progress */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Progress (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          {...register("progress")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Description */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description", { required: "Description is required" })}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.description && (
        <p className="text-red-500 text-sm ml-32">
          {errors.description.message}
        </p>
      )}

      {/* AssignedUsers */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Assigned Users
        </label>
        <Controller
          name="assignedUsers"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={userOptions}
              isMulti
              className="flex-1"
              onChange={(selectedOptions) =>
                field.onChange(selectedOptions.map((option) => option.value))
              }
              value={userOptions.filter((option) =>
                field.value?.includes(option.value)
              )}
            />
          )}
        />
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default EditTaskForm;
