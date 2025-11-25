"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { CreateTaskInput } from "@/types/task"; // adjust path if needed
import { useCreateTask } from "@/hooks/useTasks"; // hook to create a task
import { useProjects } from "@/hooks/useProjects"; // hook to fetch projects
import { useTaskStore } from "@/store/taskStore"; // import task store
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";
import { ArrowRight, Calendar } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { Role, User } from "@/types/user";
import { useRoles } from "@/hooks/useRoles";
import DatePicker from "@/components/common/DatePicker";
import {
  DatePickerValue,
  normalizeDatePickerValue,
} from "@/utils/datePicker";

// Helper to safely convert form field value to Date | null for DatePicker
const toDatePickerValue = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

interface TaskFormProps {
  onClose: () => void; // Function to close the modal
  defaultProjectId?: string; // Optional default project ID
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, defaultProjectId }) => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    defaultValues: {
      project_id: defaultProjectId || undefined,
    },
  });

  const { mutate: createTask, isPending } = useCreateTask();
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  // Retrieve tasks from the store to show the last created task
  const { tasks } = useTaskStore();
  const lastTask = tasks && tasks.length > 0 ? tasks[tasks.length - 1] : null;
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const { data: roles } = useRoles();

  // Local state for duration (in days). This field is for display/calculation only.
  const [duration, setDuration] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  // Watch start_date and end_date for changes.
  const startDateRaw = watch("start_date");
  const endDateRaw = watch("end_date");
  
  // Safely normalize form field values to Date | null, handling all edge cases
  const startDate = React.useMemo(() => {
    if (!startDateRaw) return null;
    if (startDateRaw instanceof Date) return startDateRaw;
    if (typeof startDateRaw === "string") {
      const parsed = new Date(startDateRaw);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, [startDateRaw]);
  
  const endDate = React.useMemo(() => {
    if (!endDateRaw) return null;
    if (endDateRaw instanceof Date) return endDateRaw;
    if (typeof endDateRaw === "string") {
      const parsed = new Date(endDateRaw);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, [endDateRaw]);

  // Calculate duration when start_date or end_date change.
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    } else {
      setDuration("");
    }
  }, [startDate, endDate]);

  // When the user types in the duration field, update the end_date automatically.
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    // If a valid start date exists and duration is a valid number, update the end_date.
    if (startDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedEndDate = new Date(startDate);
      calculatedEndDate.setDate(
        calculatedEndDate.getDate() + Number(newDuration)
      );
      setValue("end_date", calculatedEndDate);
    }
  };

  const onSubmit = (data: CreateTaskInput) => {
    // If defaultProjectId is provided, use it regardless of form selection.
    const submitData = defaultProjectId
      ? { ...data, project_id: defaultProjectId }
      : data;

    createTask(submitData, {
      onSuccess: () => {
        onClose(); // Close the modal on success
        // window.location.reload();
      },
    });
  };

  // Options for status and priority
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

  // Map fetched projects to options for the select.
  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.title,
    })) || [];

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
        <h3 className="text-xl font-semibold text-gray-800">Create Task</h3>
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
            {...register("task_name", { required: "Task Name is required" })}
            placeholder="Enter Task Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.task_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.task_name.message}
            </p>
          )}
        </div>

        {/* Project Select - Only show if no defaultProjectId provided */}
        {!defaultProjectId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <Controller
              name="project_id"
              control={control}
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
                  isClearable
                  placeholder="Select a project"
                />
              )}
            />
            {projectsError && (
              <p className="text-red-500 text-sm mt-1">
                Error loading projects
              </p>
            )}
          </div>
        )}

        {/* Status and Priority Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Latest Task History Card */}
        <div className="p-4 rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">
          <h4 className="text-lg font-semibold mb-2">Latest Task</h4>
          {lastTask ? (
            <div>
              <p className="font-medium flex items-center">
                <Calendar size={16} className="mr-2" />
                {lastTask.task_name}
              </p>
              <div className="flex items-center text-sm mt-1">
                <Calendar size={16} className="mr-1" />
                <span>{format(lastTask.start_date, useEthiopianDate)}</span>
                <ArrowRight size={16} className="mx-2" />
                <Calendar size={16} className="mr-1" />
                <span>{format(lastTask.end_date, useEthiopianDate)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm">No task history available</p>
          )}
        </div>

        {/* Dates Section with Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  value={toDatePickerValue(field.value)}
                  onChange={(value) =>
                    field.onChange(normalizeDatePickerValue(value))
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                />
              )}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.start_date.message}
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
                  value={toDatePickerValue(field.value)}
                  onChange={(value) => {
                    const nextDate = normalizeDatePickerValue(value);
                    field.onChange(nextDate);
                    if (startDate && nextDate) {
                      const diffTime = nextDate.getTime() - startDate.getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      setDuration(diffDays.toString());
                    } else if (!nextDate) {
                      setDuration("");
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
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
                // Only send the user ids (the role is only displayed in the label)
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description")}
            placeholder="Please Enter Description"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={5}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
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

          {/* File list */}
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

export default TaskForm;
