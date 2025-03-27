"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Activity } from "@/types/activity";
import { useCreateActivity } from "@/hooks/useActivities";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "react-toastify";
import { ArrowRight, Calendar } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { useActivityStore } from "@/store/activityStore";

interface ActivityFormProps {
  onClose: () => void;
  defaultTaskId?: string;
}

const ActivityForm: React.FC<ActivityFormProps> = ({
  onClose,
  defaultTaskId,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Activity>({
    defaultValues: {
      task_id: defaultTaskId || undefined,
      priority: "Medium", // Default value for priority
      status: "Not Started", // Default value for status
      approvalStatus: "Pending", // Default value for approvalStatus
      progress: 0, // Default progress
    },
  });

  const { mutate: createActivity, isPending } = useCreateActivity();
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useTasks();
  const { activities } = useActivityStore();
  const lastActivity =
    activities && activities.length > 0
      ? activities[activities.length - 1]
      : null;

  const onSubmit = (data: Activity) => {
    const submitData = defaultTaskId
      ? { ...data, task_id: defaultTaskId }
      : data;

    createActivity(submitData, {
      onSuccess: () => {
        toast.success("Activity created successfully!");
        onClose();
        window.location.reload();
      },
    });
  };

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

  const approvalStatusOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Not Approved", label: "Not Approved" },
    { value: "Pending", label: "Pending" },
  ];

  const taskOptions =
    tasks?.map((task) => ({
      value: task.id,
      label: task.task_name,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Activity</h3>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        {/* Required Fields */}
        <div className="grid grid-cols-1 gap-6">
          {/* Activity Name (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("activity_name", {
                required: "Activity Name is required",
              })}
              placeholder="Enter Activity Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.activity_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.activity_name.message}
              </p>
            )}
          </div>

          {/* Latest Task History Card */}
          <div className="p-4 rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">
            <h4 className="text-lg font-semibold mb-2">Latest Activity</h4>
            {lastActivity ? (
              <div>
                <p className="font-medium flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {lastActivity.activity_name}
                </p>
                <div className="flex items-center text-sm mt-1">
                  <Calendar size={16} className="mr-1" />
                  <span>{formatDate(lastActivity.start_date)}</span>
                  <ArrowRight size={16} className="mx-2" />
                  <Calendar size={16} className="mr-1" />
                  <span>{formatDate(lastActivity.end_date)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm">No activity history available</p>
            )}
          </div>

          {/* Dates (Both Required) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
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
                    placeholderText="Select start date"
                  />
                )}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <Controller
                name="end_date"
                control={control}
                rules={{
                  required: "End date is required",
                  validate: (value, formValues) =>
                    new Date(value) >= new Date(formValues.start_date) ||
                    "End date must be after start date",
                }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select end date"
                    minDate={new Date()}
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
        </div>

        {/* Optional Fields (other than Description) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Select (Optional unless defaultTaskId is provided) */}
          {!defaultTaskId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task
              </label>
              <Controller
                name="task_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={taskOptions}
                    isLoading={tasksLoading}
                    className="basic-single"
                    classNamePrefix="select"
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    value={taskOptions.find(
                      (option) => option.value === field.value
                    )}
                    isClearable
                    placeholder="Select a task"
                  />
                )}
              />
              {tasksError && (
                <p className="text-red-500 text-sm mt-1">Error loading tasks</p>
              )}
            </div>
          )}
        </div>

        {/* Priority and Approval Status (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="basic-single"
                  classNamePrefix="select"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Status
            </label>
            <Controller
              name="approvalStatus"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={approvalStatusOptions}
                  className="basic-single"
                  classNamePrefix="select"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={approvalStatusOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
          </div>
        </div>

        {/* Unit and Progress (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <input
              type="text"
              {...register("unit")}
              placeholder="Enter unit (e.g., kg, pieces)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress (%)
            </label>
            <input
              type="number"
              {...register("progress", {
                min: { value: 0, message: "Progress cannot be less than 0" },
                max: { value: 100, message: "Progress cannot exceed 100" },
              })}
              placeholder="Enter progress (0-100)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              min="0"
              max="100"
            />
            {errors.progress && (
              <p className="text-red-500 text-sm mt-1">
                {errors.progress.message}
              </p>
            )}
          </div>
        </div>
        {/* Status (Required) */}
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
                className="basic-single"
                classNamePrefix="select"
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
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Description Field  */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter Activity Description"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={4}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary/90"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Activity"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ActivityForm;
