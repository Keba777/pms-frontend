"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import EtDatePicker from "habesha-datepicker";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateActivityInput } from "@/types/activity";
import { Role, User } from "@/types/user";
import { useRoles } from "@/hooks/useRoles";
import { useSettingsStore } from "@/store/settingsStore";

const EditActivityForm: React.FC<{
  onSubmit: (data: UpdateActivityInput) => void;
  onClose: () => void;
  activity: UpdateActivityInput;
  users?: User[];
}> = ({ onSubmit, onClose, activity, users }) => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateActivityInput>({
    defaultValues: activity,
  });
  const { data: roles } = useRoles();

  const priorityOptions = [
    { value: "Critical", label: "Critical" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "Started", label: "Started" },
    { value: "InProgress", label: "In Progress" },
    { value: "Canceled", label: "Canceled" },
    { value: "Onhold", label: "Onhold" },
    { value: "Completed", label: "Completed" },
  ];

  const approvalOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Not Approved", label: "Not Approved" },
    { value: "Pending", label: "Pending" },
  ];

  const CLIENT_ROLE_ID = "aa192529-c692-458e-bf96-42b7d4782c3d";

  const userOptions =
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
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Activity</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Activity Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("activity_name", {
            required: "Activity Name is required",
          })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.activity_name && (
        <p className="text-red-500 text-sm ml-32">
          {errors.activity_name.message}
        </p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Priority<span className="text-red-500">*</span>
        </label>
        <Controller
          name="priority"
          control={control}
          rules={{ required: "Priority is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={priorityOptions}
              className="flex-1"
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
      {errors.priority && (
        <p className="text-red-500 text-sm ml-32">{errors.priority.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Unit<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("unit", { required: "Unit is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.unit && (
        <p className="text-red-500 text-sm ml-32">{errors.unit.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Quantity
        </label>
        <input
          type="number"
          {...register("quantity")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.quantity && (
        <p className="text-red-500 text-sm ml-32">{errors.quantity.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Assigned Users
        </label>
        <Controller
          name="assignedUsers"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={userOptions}
              isMulti
              className="flex-1"
              onChange={(selectedOptions) =>
                field.onChange(selectedOptions.map((option) => option.value))
              }
              value={userOptions.filter((option) =>
                field.value?.includes(option.value)
              )}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Start Date<span className="text-red-500">*</span>
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
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  placeholderText="Enter Start Date"
                />
              )}
            </>
          )}
        />
      </div>
      {errors.start_date && (
        <p className="text-red-500 text-sm ml-32">
          {errors.start_date.message}
        </p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          End Date<span className="text-red-500">*</span>
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
                  }}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  placeholderText="Enter End Date"
                />
              )}
            </>
          )}
        />
      </div>
      {errors.end_date && (
        <p className="text-red-500 text-sm ml-32">{errors.end_date.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Progress (%):
        </label>
        <input
          type="number"
          min="0"
          max="100"
          {...register("progress")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Status<span className="text-red-500">*</span>
        </label>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={statusOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={statusOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>
      {errors.status && (
        <p className="text-red-500 text-sm ml-32">{errors.status.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Approval<span className="text-red-500">*</span>
        </label>
        <Controller
          name="approvalStatus"
          control={control}
          rules={{ required: "Approval status is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={approvalOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={approvalOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>
      {errors.approvalStatus && (
        <p className="text-red-500 text-sm ml-32">
          {errors.approvalStatus.message}
        </p>
      )}

      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.description && (
        <p className="text-red-500 text-sm ml-32">
          {errors.description.message}
        </p>
      )}

      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
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

export default EditActivityForm;
