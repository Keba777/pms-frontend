"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { UpdateUserInput, User } from "@/types/user";

interface EditUserFormProps {
  onSubmit: (data: UpdateUserInput) => void;
  onClose: () => void;
  user: User;
}

interface SelectOption {
  value: string;
  label: string;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  onSubmit,
  onClose,
  user,
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    defaultValues: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      password: undefined,
      profile_picture: user.profile_picture,
      siteId: user.siteId,
      department_id: user.department_id,
      role_id: user.role_id,
      status: user.status,
      responsiblities: user.responsiblities || [],
    },
  });

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
  } = useRoles();

  const siteOptions: SelectOption[] =
    sites?.map((s) => ({ value: s.id, label: s.name })) || [];
  const departmentOptions: SelectOption[] =
    departments?.map((d) => ({ value: d.id, label: d.name })) || [];
  const roleOptions: SelectOption[] =
    roles?.map((r) => ({ value: r.id!, label: r.name })) || [];
  const statusOptions: SelectOption[] = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];

  // Responsibilities state
  const [respInput, setRespInput] = useState("");
  const responsibilities = watch("responsiblities") || [];

  const addResponsibility = () => {
    const val = respInput.trim();
    if (val) {
      setValue("responsiblities", [...responsibilities, val]);
      setRespInput("");
    }
  };
  const removeResponsibility = (idx: number) => {
    const updated = [...responsibilities];
    updated.splice(idx, 1);
    setValue("responsiblities", updated);
  };

  // Make sure selects pick up existing values once data loads
  useEffect(() => {
    if (sites) setValue("siteId", user.siteId);
    if (roles) setValue("role_id", user.role_id);
    if (departments && user.department_id)
      setValue("department_id", user.department_id);
  }, [sites, roles, departments, setValue, user]);

  const submit = (data: UpdateUserInput) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="bg-white rounded-lg shadow p-6 space-y-6"
    >
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold">Edit User</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-red-500 text-2xl"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* First / Last */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("first_name", { required: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm">Required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("last_name", { required: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm">Required</p>
            )}
          </div>
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone", { required: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.phone && <p className="text-red-500 text-sm">Required</p>}
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium">
            Password (leave blank to keep current)
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Site / Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Site</label>
            <Controller
              name="siteId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={siteOptions}
                  isLoading={sitesLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    siteOptions.find((o) => o.value === field.value) || null
                  }
                />
              )}
            />
            {sitesError && (
              <p className="text-red-500 text-sm">Error loading sites</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Department</label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={departmentOptions}
                  isLoading={depsLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    departmentOptions.find((o) => o.value === field.value) ||
                    null
                  }
                />
              )}
            />
            {depsError && (
              <p className="text-red-500 text-sm">Error loading departments</p>
            )}
          </div>
        </div>

        {/* Role / Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Role <span className="text-red-500">*</span>
            </label>
            <Controller
              name="role_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={roleOptions}
                  isLoading={rolesLoading}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    roleOptions.find((o) => o.value === field.value) || null
                  }
                />
              )}
            />
            {errors.role_id && <p className="text-red-500 text-sm">Required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={statusOptions}
                  onChange={(opt) => field.onChange(opt?.value)}
                  value={
                    statusOptions.find((o) => o.value === field.value) || null
                  }
                />
              )}
            />
          </div>
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-sm font-medium">Responsibilities</label>
          <div className="flex gap-2 items-center">
            <input
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              placeholder="Add responsibility"
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              type="button"
              onClick={addResponsibility}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {responsibilities.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
              >
                {r}
                <button
                  type="button"
                  onClick={() => removeResponsibility(i)}
                  className="ml-2 text-red-500 font-bold"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
