"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
      priority: "Medium",
      status: "Not Started",
      approvalStatus: "Pending",
      progress: 0,
      work_force: [],
      machinery_list: [],
      materials_list: [],
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
  const {
    fields: wfFields,
    append: wfAppend,
    remove: wfRemove,
  } = useFieldArray({ control, name: "work_force" });
  const {
    fields: machFields,
    append: machAppend,
    remove: machRemove,
  } = useFieldArray({ control, name: "machinery_list" });
  const {
    fields: matFields,
    append: matAppend,
    remove: matRemove,
  } = useFieldArray({ control, name: "materials_list" });

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
        // window.location.reload();
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

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 underline underline-offset-4">
          Basic Assumptions
        </h2>

        {/* Labor / Machinery / Materials factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Index Factor
            </label>
            <input
              type="number"
              step="0.01"
              {...register("labor_index_factor")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter labor index factor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Utilization Factor
            </label>
            <input
              type="number"
              step="0.01"
              {...register("labor_utilization_factor")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter utilization factor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Working Hrs/Day
            </label>
            <input
              type="number"
              step="0.1"
              {...register("labor_working_hours_per_day")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter working hours"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machinery Index Factor
            </label>
            <input
              type="number"
              step="0.01"
              {...register("machinery_index_factor")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter machinery index factor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machinery Utilization Factor
            </label>
            <input
              type="number"
              step="0.01"
              {...register("machinery_utilization_factor")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter utilization factor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machinery Working Hrs/Day
            </label>
            <input
              type="number"
              step="0.1"
              {...register("machinery_working_hours_per_day")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter working hours"
            />
          </div>
        </div>

        {/* Dynamic workforce */}
        <section className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Work Force
          </h4>
          {wfFields.map((f, i) => (
            <div key={f.id} className="flex gap-4 mb-4 items-center">
              <input
                placeholder="Man Power"
                {...register(`work_force.${i}.man_power` as const, {})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Quantity"
                {...register(`work_force.${i}.qty`, { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Rate"
                {...register(`work_force.${i}.rate`, { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Estimated Hours"
                {...register(`work_force.${i}.est_hrs`, {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => wfRemove(i)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                –
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              wfAppend({ man_power: "", qty: 0, rate: 0, est_hrs: 0 })
            }
            className="mt-2 px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary/90 transition-colors duration-200"
          >
            + Add Work Force
          </button>
        </section>

        {/* Dynamic machinery list */}
        <section className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Machinery List
          </h4>
          {machFields.map((f, i) => (
            <div key={f.id} className="flex gap-4 mb-4 items-center">
              <input
                placeholder="Equipment"
                {...register(`machinery_list.${i}.equipment` as const)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Quantity"
                {...register(`machinery_list.${i}.qty`, {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Rate"
                {...register(`machinery_list.${i}.rate`, {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Estimated Hours"
                {...register(`machinery_list.${i}.est_hrs`, {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => machRemove(i)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                –
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              machAppend({ equipment: "", qty: 0, rate: 0, est_hrs: 0 })
            }
            className="mt-2 px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary/90 transition-colors duration-200"
          >
            + Add Machinery
          </button>
        </section>

        {/* Dynamic materials list */}
        <section className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Materials List
          </h4>
          {matFields.map((f, i) => (
            <div key={f.id} className="flex gap-4 mb-4 items-center">
              <input
                placeholder="Material"
                {...register(`materials_list.${i}.material` as const)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Quantity"
                {...register(`materials_list.${i}.qty`, {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Rate"
                {...register(`materials_list.${i}.rate`, {
                  valueAsNumber: true,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => matRemove(i)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                –
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => matAppend({ material: "", qty: 0, rate: 0 })}
            className="mt-2 px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary/90 transition-colors duration-200"
          >
            + Add Material
          </button>
        </section>

        {/* Checked by */}
        <div className="grid grid-cols-1 md:gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checked By Name
            </label>
            <input
              type="text"
              {...register("checked_by_name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checked By Date
            </label>
            <Controller
              control={control}
              name="checked_by_date"
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary focus:border-bs-primary transition-colors duration-200"
                  dateFormat="MM/dd/yyy"
                  placeholderText="Select date"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
          </div>
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
