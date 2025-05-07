"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateActivityInput } from "@/types/activity";
import { useCreateActivity } from "@/hooks/useActivities";
import { useTasks } from "@/hooks/useTasks";
import { ArrowRight, Calendar } from "lucide-react";
import { formatDate } from "@/utils/helper";
import { useActivityStore } from "@/store/activityStore";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { Role, User } from "@/types/user";

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateActivityInput>({
    defaultValues: {
      task_id: defaultTaskId || undefined,
      priority: "Medium", // Default value for priority
      status: "Not Started", // Default value for status
      approvalStatus: "Pending", // Default value for approvalStatus
      progress: 0, // Default progress
      // quantity remains optional
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

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const { data: roles } = useRoles();
  const [duration, setDuration] = useState<string>("");

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  useEffect(() => {
    if (startDate && endDate) {
      const diffTime =
        new Date(endDate).getTime() - new Date(startDate).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  }, [startDate, endDate]);

  // Update end_date when the user changes the duration manually.
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    if (startDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedEndDate = new Date(startDate);
      calculatedEndDate.setDate(
        calculatedEndDate.getDate() + Number(newDuration)
      );
      setValue("end_date", calculatedEndDate);
    }
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const onSubmit = (data: CreateActivityInput) => {
    const submitData = defaultTaskId
      ? { ...data, task_id: defaultTaskId }
      : data;

    createActivity(submitData, {
      onSuccess: () => {
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

  // const approvalStatusOptions = [
  //   { value: "Approved", label: "Approved" },
  //   { value: "Not Approved", label: "Not Approved" },
  //   { value: "Pending", label: "Pending" },
  // ];

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
          className="text-3xl text-red-500 hover:text-red-600"
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

          {/* Latest Activity History Card */}
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

          {/* Dates and Duration Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Start Date */}
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
                    showYearDropdown
                    scrollableYearDropdown
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
                Duration (days){" "}
                <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                value={duration}
                onChange={handleDurationChange}
                placeholder="Enter duration in days"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>

            {/* End Date */}
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
                    onChange={(date) => {
                      field.onChange(date);
                      if (startDate && date) {
                        const diffTime =
                          new Date(date).getTime() -
                          new Date(startDate).getTime();
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );
                        setDuration(diffDays.toString());
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select end date"
                    minDate={new Date()}
                    showYearDropdown
                    scrollableYearDropdown
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

        {/* Optional Fields */}
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

        {/* Priority and Approval Status */}
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
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* <div>
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
          </div> */}
        </div>

        {/* Unit and Progress */}
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
          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              // type="number"
              {...register("quantity")}
              placeholder="Enter quantity"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
        </div>

        {/* Description Field */}
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

        <h2 className="text-xl font-bold text-center underline">
          Basic Assumptions
        </h2>
        <div>
          <h3 className="font-semibold">Labor</h3>
          <div className="my-1">
            <label htmlFor="">1. Index factor:- </label>
            <input
              type="text"
              // placeholder="Index factor:-"
              className="ml-[88px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div className="my-1 ">
            <label htmlFor="">2. Utilization Factor:- </label>
            <input
              type="text"
              // placeholder="UF"
              className="ml-14 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>

          <div>
            <label htmlFor="">3. Working hours per day:- </label>
            <input
              type="text"
              // placeholder="Working hours per day"
              className="ml-4 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <button className="bg-cyan-700 text-gray-100 px-4 py-2 rounded-md">
            Add More
          </button>
        </div>

        <div>
          <h3 className="font-semibold">Machinery</h3>
          <div className="my-1">
            <label htmlFor="">1. Index factor:- </label>
            <input
              type="text"
              // placeholder="Index factor:-"
              className="ml-[88px] px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div className="my-1 ">
            <label htmlFor="">2. Utilization Factor:- </label>
            <input
              type="text"
              // placeholder="UF"
              className="ml-14 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>

          <div>
            <label htmlFor="">3. Working hours per day:- </label>
            <input
              type="text"
              // placeholder="Working hours per day"
              className="ml-4 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <button className="bg-cyan-700 text-gray-100 px-4 py-2 rounded-md">
            Add More
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center space-x-4">
          <label className="w-32 text-sm font-medium text-gray-700">
            Progress (%):
          </label>
          <Controller
            name="progress"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  {...field}
                  className="flex-1"
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
                <span className="w-12 text-right">{field.value}%</span>
              </div>
            )}
          />
        </div>
        <div>
          <label htmlFor="">Checked by:- </label>
          <input
            type="text"
            // placeholder="Checked by:-"
            className="ml-4 px-3 border  focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          <input
            type="date"
            name=""
            id=""
            className="ml-4 px-3 border  focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
