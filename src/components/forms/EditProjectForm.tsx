"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import EtDatePicker from "habesha-datepicker";
import { Info } from "lucide-react";
import { UpdateProjectInput } from "@/types/project";
import { User } from "@/types/user";
import { useSites } from "@/hooks/useSites";
import { useSettingsStore } from "@/store/settingsStore";

interface EditProjectFormProps {
  onSubmit: (data: UpdateProjectInput) => void;
  onClose: () => void;
  project: UpdateProjectInput;
  users: User[] | undefined;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({
  onSubmit,
  onClose,
  project,
  users,
}) => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    defaultValues: project,
  });
  const { data: sites, isLoading: sitesLoading, error: sitesError } = useSites();

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

  const memberOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.role?.name})`,
    })) || [];

  const siteOptions =
    sites?.map((site) => ({
      value: site.id,
      label: site.name,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Edit Project</h3>
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Status, Priority, and Favourite */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  onChange={(option) => field.onChange(option?.value)}
                  value={priorityOptions.find((o) => o.value === field.value)}
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
                  onChange={(option) => field.onChange(option?.value)}
                  value={statusOptions.find((o) => o.value === field.value)}
                />
              )}
            />
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="flex items-center mt-5">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                {...register("isFavourite")}
                className="h-4 w-4 text-bs-primary focus:ring-bs-primary border-gray-300 rounded mr-2"
              />
              Favourite
            </label>
          </div>
        </div>

        {/* Budget, Progress, and Dates */}
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
              Progress (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              {...register("progress")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
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
                <EtDatePicker
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
              Ends At <span className="text-red-500">*</span>
            </label>
            <Controller
              name="end_date"
              control={control}
              rules={{ required: "End date is required" }}
              render={({ field }) => (
                <EtDatePicker
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
              Site <span className="text-red-500">*</span>
              <Info className="inline ml-1 text-bs-primary h-4 w-4" />
            </label>
            <Controller
              name="site_id"
              control={control}
              rules={{ required: "Site is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={siteOptions}
                  isLoading={sitesLoading}
                  className="w-full text-sm"
                  onChange={(selected) => field.onChange(selected?.value)}
                  value={siteOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
            {errors.site_id && (
              <p className="text-red-500 text-sm mt-1">{errors.site_id.message}</p>
            )}
            {sitesError && (
              <p className="text-red-500 text-sm mt-1">Error loading sites</p>
            )}
          </div>
        </div>

        {/* Members Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Members
          </label>
          <Controller
            name="members"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={memberOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) =>
                  field.onChange(selectedOptions.map((option) => option.value))
                }
                value={memberOptions.filter((option) =>
                  field.value?.includes(option.value)
                )}
              />
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={5}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
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
          >
            Update
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditProjectForm;
