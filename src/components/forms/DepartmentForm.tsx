"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  Department,
} from "@/types/department";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "@/hooks/useDepartments";

interface DepartmentFormProps {
  onClose: () => void;
  defaultDepartment?: Department;
}

type OptionType = { label: string; value: string };

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  onClose,
  defaultDepartment,
}) => {
  const isEdit = Boolean(defaultDepartment?.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateDepartmentInput & Partial<UpdateDepartmentInput>>({
    defaultValues: {
      name: defaultDepartment?.name || "",
      description: defaultDepartment?.description || "",
      status: defaultDepartment?.status || "Active",
      subDepartment: defaultDepartment?.subDepartment?.[0] || undefined,
      id: defaultDepartment?.id,
    },
  });

  const { mutate: createDepartment } = useCreateDepartment();
  const { mutate: updateDepartment } = useUpdateDepartment();

  const statusOptions: OptionType[] = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Pending", label: "Pending" },
  ];

  const onSubmit = (data: UpdateDepartmentInput | CreateDepartmentInput) => {
    if (isEdit) {
      updateDepartment(data as UpdateDepartmentInput, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      createDepartment(data as CreateDepartmentInput, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          {isEdit ? "Update Department" : "Create Department"}
        </h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("name", { required: "Department Name is required" })}
            placeholder="Enter Department Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Optional description"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows={4}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={statusOptions}
                onChange={(option: OptionType | null) => {
                  field.onChange(option?.value ?? "");
                }}
                value={statusOptions.find((opt) => opt.value === field.value)}
              />
            )}
          />
        </div>

        {/* Sub-department */}
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-gray-700">
            Sub-department (optional)
          </legend>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              {...register("subDepartment.name")}
              placeholder="Enter sub-department name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register("subDepartment.description")}
              placeholder="Optional description"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update"
              : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DepartmentForm;
