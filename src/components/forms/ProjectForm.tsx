// components/forms/ProjectForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Info } from "lucide-react";
import Select from "react-select";
import { CreateProjectInput } from "@/types/project";
import { useCreateProject } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types/user";
import { useCreateNotification } from "@/hooks/useNotifications";
import { useSites } from "@/hooks/useSites";
import { useSettingsStore } from "@/store/settingsStore";
import { useClients } from "@/hooks/useClients";
import EtDatePicker from "habesha-datepicker"; 
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ProjectFormProps {
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose }) => {
  const { useEthiopianDate } = useSettingsStore();
  const DatePickerComponent = useEthiopianDate ? EtDatePicker : ReactDatePicker;
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
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
  const { data: sites, isLoading: sitesLoading, error: sitesError } = useSites();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [duration, setDuration] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const startDateStr = watch("start_date");
  const endDateStr = watch("end_date");

  useEffect(() => {
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  }, [startDateStr, endDateStr]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    const startDate = startDateStr ? new Date(startDateStr) : null;
    if (startDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedEndDate = new Date(startDate);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + Number(newDuration));
      // end_date is stored as an ISO string in this form; cast the field name to any to satisfy setValue typing
      setValue("end_date" as any, calculatedEndDate ? calculatedEndDate.toISOString() : undefined);
    }
  };

  const onSubmit = (data: CreateProjectInput) => {
    createProject(data, {
      onSuccess: (project) => {
        onClose();
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

  const CLIENT_ROLE_ID = "aa192529-c692-458e-bf96-42b7d4782c3d";

  const memberOptions =
    users
      ?.filter((user: User) => user.role_id !== CLIENT_ROLE_ID)
      .map((user: User) => ({
        value: user.id!,
        label: `${user.first_name} ${user.last_name} (${user.role?.name || "No Role"})`,
      })) || [];

  const siteOptions =
    sites?.map((site) => ({
      value: site.id!,
      label: site.name,
    })) || [];

  const clientOptions =
    clients?.map((client) => ({
      value: client.id,
      label: client.companyName,
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
                <>
                  {useEthiopianDate ? (
                    <EtDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                      isRange={false}
                    />
                  ) : (
                    <ReactDatePicker
                      showFullMonthYearPicker
                      showYearDropdown
                      selected={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                      }}
                      placeholderText="Enter Start Date"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    />
                  )}
                </>
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
                <>
                  {useEthiopianDate ? (
                    <EtDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                        const startDate = startDateStr ? new Date(startDateStr) : null;
                        if (startDate && d) {
                          const diffTime = d.getTime() - startDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          setDuration(diffDays.toString());
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                      isRange={false}
                    />
                  ) : (
                    <ReactDatePicker
                      showFullMonthYearPicker
                      showYearDropdown
                      selected={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                        const startDate = startDateStr ? new Date(startDateStr) : null;
                        if (startDate && d) {
                          const diffTime = d.getTime() - startDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          setDuration(diffDays.toString());
                        }
                      }}
                      placeholderText="Enter End Date"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    />
                  )}
                </>
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
             <div className="mt-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client (Existing)
                </label>
                <Controller
                  name="client_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={clientOptions}
                      isLoading={clientsLoading}
                      className="w-full text-sm"
                      onChange={(selected) => {
                          field.onChange(selected?.value);
                          // Optional: Auto-fill the "Client" text field if selecting an existing one
                          if (selected) setValue("client", selected.label);
                      }}
                      value={clientOptions.find((opt) => opt.value === field.value)}
                      placeholder="Select a client..."
                    />
                  )}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site
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
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
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
