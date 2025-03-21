"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateTaskInput } from "@/types/task"; // adjust path if needed
import { useCreateTask } from "@/hooks/useTasks"; // hook to create a task
import { useProjects } from "@/hooks/useProjects"; // hook to fetch projects
import { toast } from "react-toastify";

interface TaskFormProps {
  onClose: () => void; // Function to close the modal
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTaskInput>();

  const { mutate: createTask, isPending } = useCreateTask();
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const onSubmit = (data: CreateTaskInput) => {
    createTask(data, {
      onSuccess: () => {
        toast.success("Task created successfully!");
        onClose(); // Close the modal on success
        window.location.reload(); // Reload the page
      },
    });
  };

  // Options for status and priority (same as in your ProjectForm)
  const statusOptions = [
    {
      value: "Not Started",
      label: "Not Started",
      className: "bg-bs-dark-100 text-bs-dark",
    },
    {
      value: "Started",
      label: "Started",
      className: "bg-bs-danger-100 text-bs-danger",
    },
    {
      value: "InProgress",
      label: "In Progress",
      className: "bg-bs-secondary-100 text-bs-secondary",
    },
    {
      value: "Canceled",
      label: "Canceled",
      className: "bg-bs-danger-100 text-bs-danger",
    },
    {
      value: "Onhold",
      label: "Onhold",
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
      value: "Critical",
      label: "Critical",
      className: "bg-bs-danger-100 text-bs-danger",
    },
    {
      value: "High",
      label: "High",
      className: "bg-bs-info-100 text-bs-info",
    },
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

  // Map fetched projects to options for the select
  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.title,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Task</h3>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose} // Close the modal
        >
          &times; {/* Close icon */}
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
            {...register("task_name", { required: "Task Name is required" })}
            placeholder="Enter Task Name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.task_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.task_name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter Task Description"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={4}
          />
        </div>

        {/* Project Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project <span className="text-red-500">*</span>
          </label>
          <Controller
            name="project_id"
            control={control}
            rules={{ required: "Project is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={projectOptions}
                isLoading={projectsLoading}
                className="basic-single"
                classNamePrefix="select"
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                value={projectOptions.find(
                  (option) => option.value === field.value
                )}
              />
            )}
          />
          {projectsError && (
            <p className="text-red-500 text-sm mt-1">Error loading projects</p>
          )}
        </div>

        {/* Status and Priority Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
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
          </div>
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starts At <span className="text-red-500">*</span>
            </label>
            <Controller
              name="start_date"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                />
              )}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends At <span className="text-red-500">*</span>
            </label>
            <Controller
              name="end_date"
              control={control}
              rules={{ required: "End date is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                />
              )}
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.end_date.message}
              </p>
            )}
          </div>
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
            className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
