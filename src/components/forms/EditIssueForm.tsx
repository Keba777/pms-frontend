"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateIssueInput } from "@/types/issue";
import { useDepartments } from "@/hooks/useDepartments";
import { useSites } from "@/hooks/useSites";
import { useUsers } from "@/hooks/useUsers";
import Select from "react-select";
import { Department } from "@/types/department";
import { Site } from "@/types/site";
import { User } from "@/types/user";
import ReactDatePicker from "react-datepicker";

interface EditIssueFormProps {
  onSubmit: (data: UpdateIssueInput) => void;
  onClose: () => void;
  issue: UpdateIssueInput;
}

const EditIssueForm: React.FC<EditIssueFormProps> = ({
  onSubmit,
  onClose,
  issue,
}) => {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateIssueInput>({
    defaultValues: issue,
  });

  const { data: departments } = useDepartments();
  const { data: sites } = useSites();
  const { data: users } = useUsers();

  const departmentOptions = departments?.map((dept: Department) => ({
    value: dept.id,
    label: dept.name,
  })) || [];

  const siteOptions = sites?.map((site: Site) => ({
    value: site.id,
    label: site.name,
  })) || [];

  const userOptions = users?.map((user: User) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name}`,
  })) || [];

  const priorityOptions = [
    { value: "Urgent", label: "Urgent" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const statusOptions = [
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Resolved", label: "Resolved" },
    { value: "Closed", label: "Closed" },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Issue</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Issue Type */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Issue Type</label>
        <input
          type="text"
          {...register("issueType")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Description */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Priority */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Priority</label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={priorityOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={priorityOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      {/* Site */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Site</label>
        <Controller
          name="siteId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={siteOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={siteOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      {/* Department */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Department</label>
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={departmentOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={departmentOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      {/* Responsible */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Responsible</label>
        <Controller
          name="responsibleId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={userOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={userOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      {/* Action Taken */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Action Taken</label>
        <textarea
          {...register("actionTaken")}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Status */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={statusOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={statusOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      {/* Date */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Date</label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <>
              <ReactDatePicker
                showFullMonthYearPicker
                showYearDropdown
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any, event?: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                placeholderText="Enter Date"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </>
          )}
        />
      </div>

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

export default EditIssueForm;
