"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info } from "lucide-react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateProjectInput } from "@/types/project";
import { useCreateProject } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { useTags } from "@/hooks/useTags";
import { Tag } from "@/types/tag";
import { useRoles } from "@/hooks/useRoles";
import { Role } from "@/types/user";
import { useCreateNotification } from "@/hooks/useNotifications";

interface ProjectFormProps {
  onClose: () => void; // Function to close the modal
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>();

  const { mutate: createProject, isPending } = useCreateProject();
  const { mutate: createNotification } = useCreateNotification();
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const { data: tags, isLoading: tagsLoading, error: tagsError } = useTags();
  const { data: roles } = useRoles();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  // Local state for duration (in days). This field is for display/calculation only.
  const [duration, setDuration] = useState<string>("");

  // Watch start_date and end_date for changes.
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // Calculate duration when the end date is updated by the user.
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime =
        new Date(endDate).getTime() - new Date(startDate).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  }, [startDate, endDate]);

  // When the user types in the duration field, update the end_date automatically
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

  const onSubmit = (data: CreateProjectInput & { members?: string[] }) => {
    createProject(data, {
      onSuccess: (project) => {
        onClose();
        // window.location.reload();
        // Send a notification to each assigned member
        if (data.members?.length) {
          data.members.forEach((userId) => {
            createNotification({
              user_id: userId,
              type: "project.assigned",
              data: {
                projectId: project.id,
                projectName: project.title,
              },
            });
          });
        }
      },
    });
  };

  // Options for dropdowns
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

  // Map fetched users to options for the multi-select.
  // Each option now displays user's first name along with their role (from the roles store) in parentheses.
  const CLIENT_ROLE_ID = "aa192529-c692-458e-bf96-42b7d4782c3d";

  const memberOptions =
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

  const tagOptions =
    tags?.map((tag: Tag) => ({
      value: tag.id!,
      label: tag.name,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Project</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title", { required: "Title is required" })}
            placeholder="Please Enter Title"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        {/* Status and Priority Section */}
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

        {/* Budget and Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planned Budget
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("budget", { required: "Budget is required" })}
                placeholder="Please Enter Budget"
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">
                {errors.budget.message}
              </p>
            )}
          </div>

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
              Duration (days) <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={handleDurationChange}
              placeholder="Enter duration in days"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>

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

        {/* Client and Site Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <input
              type="text"
              {...register("client", { required: "Client is required" })}
              placeholder="Enter Client Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.client && (
              <p className="text-red-500 text-sm mt-1">
                {errors.client.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site
              <Info className="inline ml-1 text-bs-primary h-4 w-4" />
            </label>
            <input
              type="text"
              {...register("site", { required: "Site is required" })}
              placeholder="Enter Site Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.site && (
              <p className="text-red-500 text-sm mt-1">{errors.site.message}</p>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned to
          </label>
          <Controller
            name="members"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={memberOptions}
                isLoading={usersLoading}
                className="basic-multi-select"
                classNamePrefix="select"
                // Only send the user ids (the role is only displayed in the label)
                onChange={(selectedOptions) =>
                  field.onChange(selectedOptions.map((option) => option.value))
                }
                value={memberOptions.filter(
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contractor
          </label>
          <input
            type="text"
            placeholder="Enter Contactor"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Contractor
          </label>
          <input
            type="text"
            placeholder="Enter Sub-Contactor"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consultant
          </label>
          <input
            type="text"
            placeholder="Enter Consultant"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tags
          </label>
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={tagOptions}
                isLoading={tagsLoading}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) =>
                  field.onChange(selectedOptions.map((option) => option.value))
                }
                value={tagOptions.filter((option) =>
                  field.value?.includes(option.value)
                )}
              />
            )}
          />
          {tagsError && (
            <p className="text-red-500 text-sm mt-1">Error loading tags</p>
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

export default ProjectForm;
