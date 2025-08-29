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
    { value: "Not Started", label: "Not Started" },
    { value: "In progress", label: "In Progress" },
    { value: "Pending", label: "Pending" },
    { value: "Completed", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "Urgent", label: "Urgent" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
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
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Todo</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Task */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Task<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("task", { required: "Task is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.task && (
        <p className="text-red-500 text-sm ml-32">{errors.task.message}</p>
      )}

      {/* Type */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Type</label>
        <input
          type="text"
          {...register("type", { required: "Type is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.type && (
        <p className="text-red-500 text-sm ml-32">{errors.type.message}</p>
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
              onChange={(option) => field.onChange(option?.value)}
              value={priorityOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

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
              onChange={(option) => field.onChange(option?.value)}
              value={statusOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>
      {errors.status && (
        <p className="text-red-500 text-sm ml-32">{errors.status.message}</p>
      )}

      {/* Due Date */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Due Date
        </label>
        <Controller
          name="dueDate"
          control={control}
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

      {/* Target */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Target</label>
        <Controller
          name="target"
          control={control}
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

      {/* Assigned Users */}
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
              onChange={(options) =>
                field.onChange(options.map((o) => o.value))
              }
              value={userOptions.filter((o) => field.value?.includes(o.value))}
            />
          )}
        />
      </div>

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

      {/* Remark */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Remark</label>
        <textarea
          {...register("remark")}
          rows={2}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Remainder */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Remainder
        </label>
        <textarea
          {...register("remainder")}
          rows={2}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Attachment */}
      {/* <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Attachment</label>
        <input
          type="file"
          multiple
          {...register("attachment")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div> */}

      {/* Actions */}
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

export default EditTodoForm;
