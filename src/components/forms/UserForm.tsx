"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { CreateUserInput } from "@/types/user";
import { useRegister } from "@/hooks/useAuth";

interface UserFormProps {
  onClose: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const UserForm: React.FC<UserFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserInput>({
    defaultValues: {
      responsiblities: [],
    },
  });

  const { mutate: createUser, isPending } = useRegister();
  const {
    data: sites,
    isLoading: sitesLoading,
    error: sitesError,
  } = useSites();
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

  const siteOptions: SelectOption[] =
    sites?.map((site) => ({ value: site.id, label: site.name })) || [];

  const departmentOptions: SelectOption[] =
    departments?.map((dep) => ({ value: dep.id, label: dep.name })) || [];

  const roleOptions: SelectOption[] =
    roles
      ?.filter((role) => role.id !== undefined)
      .map((role) => ({ value: role.name as string, label: role.name })) || [];

  const statusOptions: SelectOption[] = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];

  const [responsibilityInput, setResponsibilityInput] = useState("");
  const responsibilities = watch("responsiblities");

  const addResponsibility = () => {
    if (responsibilityInput.trim() !== "") {
      const updated = [...(responsibilities || []), responsibilityInput.trim()];
      setValue("responsiblities", updated);
      setResponsibilityInput("");
    }
  };

  const removeResponsibility = (index: number) => {
    const updated = [...(responsibilities || [])];
    updated.splice(index, 1);
    setValue("responsiblities", updated);
  };

  const onSubmit = (data: CreateUserInput) => {
    createUser(data, {
      onSuccess: () => {
        onClose();
        window.location.reload();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create User</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
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
            className="w-full px-3 py-2 border rounded-md"
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
            className="w-full px-3 py-2 border rounded-md"
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
              className="w-full px-3 py-2 border rounded-md"
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
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            placeholder="Enter password"
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Site & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site <span className="text-red-500">*</span>
            </label>
            <Controller
              name="siteId"
              control={control}
              rules={{ required: "Site is required" }}
              render={({ field }) => (
                <Select
                  options={siteOptions}
                  isLoading={sitesLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    siteOptions.find((opt) => opt.value === field.value) || null
                  }
                />
              )}
            />
            {(errors.siteId || sitesError) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteId?.message || "Error loading sites"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={departmentOptions}
                  isLoading={depsLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    departmentOptions.find(
                      (opt) => opt.value === field.value
                    ) || null
                  }
                />
              )}
            />
            {depsError && (
              <p className="text-red-500 text-sm mt-1">
                Error loading departments
              </p>
            )}
          </div>
        </div>

        {/* Role & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <Controller
              name="role_name"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select
                  options={roleOptions}
                  isLoading={rolesLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    roleOptions.find((opt) => opt.value === field.value) || null
                  }
                />
              )}
            />
            {(errors.role_name || rolesError) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role_name?.message || "Error loading roles"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={statusOptions}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    statusOptions.find((opt) => opt.value === field.value) ||
                    null
                  }
                />
              )}
            />
          </div>
        </div>

        {/* Manual Responsibilities Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsibilities
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={responsibilityInput}
              onChange={(e) => setResponsibilityInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter responsibility and click Add"
            />
            <button
              type="button"
              onClick={addResponsibility}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
          {responsibilities && responsibilities.length > 0 && (
            <ul className="mt-2 space-y-1">
              {responsibilities.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeResponsibility(idx)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
