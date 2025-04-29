"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { GroupBase } from "react-select";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { UpdateUserInput, User } from "@/types/user";

interface EditUserFormProps {
  onSubmit: (data: UpdateUserInput) => void;
  onClose: () => void;
  user: User;
}

// Generic option type for react-select
interface SelectOption {
  value: string;
  label: string;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ onSubmit, onClose, user }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    defaultValues: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      department_id: user.department_id || undefined,
      status: user.status,
      role_id: user.role?.id,
    },
  });

  const {
    data: departments,
    isLoading: depsLoading,
    error: depsError,
  } = useDepartments();

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRoles();

  // Map fetched data into SelectOption[]
  const departmentOptions: SelectOption[] =
    departments?.map((dep) => ({ value: dep.id, label: dep.name })) || [];

  const roleOptions: SelectOption[] =
    roles
      ?.filter((role) => role.id !== undefined)
      .map((role) => ({ value: role.id as string, label: role.name })) || [];

  const statusOptions: SelectOption[] = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];

  // ensure the role select shows existing value once roles load
  useEffect(() => {
    if (roles && user.role) {
      setValue("role_id", user.role.id);
    }
  }, [roles, user.role, setValue]);

  const handleFormSubmit = (data: UpdateUserInput) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Edit User</h3>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("first_name", { required: "First name is required" })}
            placeholder="Enter first name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("last_name", { required: "Last name is required" })}
            placeholder="Enter last name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.last_name.message}
            </p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone", { required: "Phone number is required" })}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Password (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password (leave blank to keep current)
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="Enter new password"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* Department & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select<SelectOption, false, GroupBase<SelectOption>>
                  options={departmentOptions}
                  isLoading={depsLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    departmentOptions.find(
                      (opt) => opt.value === field.value
                    ) || null
                  }
                  placeholder="Select Department"
                  className="w-full"
                />
              )}
            />
            {depsError && <p className="text-red-500 text-sm mt-1">Error loading departments</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <Controller
              name="role_id"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select<SelectOption, false, GroupBase<SelectOption>>
                  options={roleOptions}
                  isLoading={rolesLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    roleOptions.find((opt) => opt.value === field.value) || null
                  }
                  placeholder="Select Role"
                  className="w-full"
                />
              )}
            />
            {(errors.role_id || rolesError) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role_id?.message || "Error loading roles"}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select<SelectOption, false, GroupBase<SelectOption>>
                options={statusOptions}
                onChange={(opt) => field.onChange(opt?.value)}
                value={
                  statusOptions.find((opt) => opt.value === field.value) || null
                }
                placeholder="Select Status"
                className="w-full"
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary/90"
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
