"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Info, Plus } from "lucide-react";
import AddClientModal from "./AddClientModal";
import AddSiteModal from "./AddSiteModal";
import { UpdateProjectInput } from "@/types/project";
import { User } from "@/types/user";
import { useSites } from "@/hooks/useSites";
import { useClients } from "@/hooks/useClients";

interface EditProjectFormProps {
  onSubmit: (data: UpdateProjectInput | FormData) => void;
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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    defaultValues: project,
  });
  const { data: sites, isLoading: sitesLoading, error: sitesError } = useSites();
  const { data: clients, isLoading: clientsLoading, error: clientsError } = useClients();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    (project as any).attachments || []
  );
  const [showClientModal, setShowClientModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = ""; // Reset input
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (urlToRemove: string) => {
    setExistingAttachments((prev) => prev.filter((url) => url !== urlToRemove));
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

  const clientOptions =
    clients?.map((client) => ({
      value: client.id,
      label: client.companyName,
    })) || [];

  const handleFormSubmit = (data: UpdateProjectInput) => {
    const formData = new FormData();
    if (project.id) formData.append("id", project.id);
    formData.append("title", data.title || "");
    formData.append("description", data.description || "");
    formData.append("priority", data.priority || "Medium");
    formData.append("status", data.status || "Not Started");
    formData.append("budget", (data.budget || 0).toString());
    formData.append("start_date", data.start_date ? new Date(data.start_date).toISOString() : "");
    formData.append("end_date", data.end_date ? new Date(data.end_date).toISOString() : "");

    if (data.client_id) formData.append("client_id", data.client_id);
    if (data.site_id) formData.append("site_id", data.site_id);
    if (data.isFavourite !== undefined) formData.append("isFavourite", String(data.isFavourite));
    if (data.progress !== undefined) formData.append("progress", data.progress.toString());

    if (data.members && data.members.length > 0) {
      data.members.forEach((memberId) => formData.append("members", memberId));
    }

    // Append New Files
    selectedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    // Append Existing Attachments
    existingAttachments.forEach((url) => {
      formData.append("existingAttachments", url);
    });

    onSubmit(formData);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
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
                  <div>
                    <ReactDatePicker
                      showFullMonthYearPicker
                      showYearDropdown
                      selected={field.value ? new Date(field.value) : undefined}
                      onChange={((date: Date | null | [Date | null, Date | null] | null, _event?: any) =>
                        field.onChange(Array.isArray(date) ? (date[0] ? date[0].toISOString() : undefined) : date ? date.toISOString() : undefined)) as any}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                      placeholderText="Enter Start Date"
                    />
                  </div>
                )}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start_date?.message}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ends At <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="end_date"
                  control={control}
                  rules={{ required: "End date is required" }}
                  render={({ field }) => (
                    <div>
                      <ReactDatePicker
                        showFullMonthYearPicker
                        showYearDropdown
                        selected={field.value ? new Date(field.value) : undefined}
                        onChange={((date: Date | null | [Date | null, Date | null] | null, _event?: any) =>
                          field.onChange(Array.isArray(date) ? (date[0] ? date[0].toISOString() : undefined) : date ? date.toISOString() : undefined)) as any}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                        placeholderText="Enter End Date"
                      />
                    </div>
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
                  Client <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
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
                          }}
                          value={clientOptions.find((opt) => opt.value === field.value)}
                          placeholder="Select Client..."
                          isClearable
                        />
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClientModal(true)}
                    className="px-3 h-[38px] bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center transition-colors"
                    title="Add New Client"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {/* Hidden input removed */}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site <span className="text-red-500">*</span>
                  <Info className="inline ml-1 text-bs-primary h-4 w-4" />
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
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
                          placeholder="Select a site..."
                          isClearable
                        />
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSiteModal(true)}
                    className="px-3 h-[38px] bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center transition-colors"
                    title="Add New Site"
                  >
                    <Plus size={18} />
                  </button>
                </div>
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
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                rows={5}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Attachments
              </label>
              {existingAttachments.length > 0 ? (
                <ul className="grid grid-cols-1 gap-2 mb-4">
                  {existingAttachments.map((url, idx) => (
                    <li key={idx} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                      <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs" title={url}>
                        {url.split("/").pop()}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(url)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic mb-4">No existing attachments</p>
              )}

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Files
              </label>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:border-cyan-700 transition-colors duration-300">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-700 file:text-white hover:file:bg-cyan-800"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Select new files to add.
                </p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">New Files Selected:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium ml-2"
                        >
                          Remove
                        </button>
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
                className="px-4 h-10 border rounded-md hover:bg-gray-50 flex items-center"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 h-10 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 flex items-center"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </form>
      {showClientModal && (
        <AddClientModal
          onClose={() => setShowClientModal(false)}
          onSuccess={(newClient) => {
            setValue("client_id", newClient.id);
            setShowClientModal(false);
          }}
        />
      )}
      {showSiteModal && (
        <AddSiteModal
          onClose={() => setShowSiteModal(false)}
          onSuccess={(newSite) => {
            setValue("site_id", newSite.id);
            setShowSiteModal(false);
          }}
        />
      )}
    </>
  );
};

export default EditProjectForm;
