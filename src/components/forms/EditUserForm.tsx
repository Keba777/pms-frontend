"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import Image from "next/image";
import { UpdateUserInput, User } from "@/types/user";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";

interface EditUserFormProps {
  onSubmit: (data: UpdateUserInput) => void;
  onClose: () => void;
  user: User;
  usePasswordField?: boolean;
}

interface Option {
  value: string;
  label: string;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  onSubmit,
  onClose,
  user,
  usePasswordField = true,
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
      siteId: user.siteId,
      department_id: user.department_id,
      role_id: user.role_id,
      status: user.status,
      responsibilities: user.responsibilities || [],
      username: user.username,
      gender: user.gender,
      position: user.position,
      terms: user.terms,
      joiningDate: user.joiningDate,
      estSalary: user.estSalary,
      ot: user.ot,
      // profile_picture omitted here
    },
  });

  // preview URL (either existing or newly picked)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.profile_picture || null
  );

  // load selects
  const { data: sites } = useSites();
  const { data: departments } = useDepartments();
  const { data: roles } = useRoles();

  // build options
  const siteOptions: Option[] =
    sites?.map((s) => ({ value: s.id, label: s.name })) || [];
  const departmentOptions: Option[] =
    departments?.map((d) => ({ value: d.id, label: d.name })) || [];
  const roleOptions: Option[] =
    roles?.map((r) => ({ value: r.id!, label: r.name })) || [];
  const statusOptions: Option[] = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];
  const genderOptions: Option[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];
  const termsOptions: Option[] = [
    { value: "Part Time", label: "Part Time" },
    { value: "Contract", label: "Contract" },
    { value: "Temporary", label: "Temporary" },
    { value: "Permanent", label: "Permanent" },
  ];

  // responsibilities
  const [respInput, setRespInput] = useState("");
  const responsibilities = watch("responsibilities") || [];
  const addResponsibility = () => {
    if (respInput.trim()) {
      setValue("responsibilities", [...responsibilities, respInput.trim()]);
      setRespInput("");
    }
  };
  const removeResponsibility = (i: number) => {
    const arr = [...responsibilities];
    arr.splice(i, 1);
    setValue("responsibilities", arr);
  };

  // sync selects
  useEffect(() => {
    setValue("siteId", user.siteId);
    setValue("role_id", user.role_id);
    if (user.department_id) setValue("department_id", user.department_id);
    if (user.joiningDate) setValue("joiningDate", new Date(user.joiningDate).toISOString().split('T')[0] as any);
  }, [user, setValue]);

  const submit = (data: UpdateUserInput) => {
    // strip out password if it's empty or undefined
    const payload: UpdateUserInput = { ...data };
    if (!payload.password) {
      delete payload.password;
    }
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="bg-white rounded-lg shadow p-6 space-y-6"
    >
      <header className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold">Edit User</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-red-500 text-2xl"
        >
          &times;
        </button>
      </header>

      {/* Profile Picture */}
      <Controller
        name="profile_picture"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Preview"
                width={96}
                height={96}
                className="rounded-full mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              // do not set value for file input
              onChange={(e) => {
                const f = e.target.files?.[0];
                field.onChange(f);
                if (f) setPreviewUrl(URL.createObjectURL(f));
              }}
              className="block"
            />
            {errors.profile_picture && (
              <p className="text-red-500 text-sm">
                {errors.profile_picture.message}
              </p>
            )}
          </div>
        )}
      />

      {/* First & Last Name */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("first_name", { required: "Required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm">{errors.first_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("last_name", { required: "Required" })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          {...register("username", { required: "Required" })}
          className="w-full border px-3 py-2 rounded"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      {/* Gender */}
      <Controller
        name="gender"
        control={control}
        rules={{ required: "Required" }}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              {...field}
              options={genderOptions}
              onChange={(o) => field.onChange(o?.value)}
              value={genderOptions.find((o) => o.value === field.value) || null}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender.message}</p>
            )}
          </div>
        )}
      />

      {/* Position */}
      <div>
        <label className="block text-sm font-medium">Position</label>
        <input
          {...register("position")}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Terms */}
      <Controller
        name="terms"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium">Terms</label>
            <Select
              {...field}
              options={termsOptions}
              onChange={(o) => field.onChange(o?.value)}
              value={termsOptions.find((o) => o.value === field.value) || null}
            />
          </div>
        )}
      />

      {/* Joining Date */}
      <div>
        <label className="block text-sm font-medium">Joining Date</label>
        <input
          type="date"
          {...register("joiningDate")}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Est Salary */}
      <div>
        <label className="block text-sm font-medium">Estimated Salary</label>
        <input
          type="number"
          step="0.01"
          {...register("estSalary")}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* OT */}
      <div>
        <label className="block text-sm font-medium">OT</label>
        <input
          type="number"
          step="0.01"
          {...register("ot")}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Email / Phone */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email", { required: "Required" })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register("phone", { required: "Required" })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Password */}
      {usePasswordField && (
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
      )}

      {/* Site / Department */}
      <div className="grid md:grid-cols-2 gap-4">
        <Controller
          name="siteId"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Site</label>
              <Select
                {...field}
                options={siteOptions}
                onChange={(o) => field.onChange(o?.value)}
                value={siteOptions.find((o) => o.value === field.value) || null}
              />
            </div>
          )}
        />
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Department</label>
              <Select
                {...field}
                options={departmentOptions}
                onChange={(o) => field.onChange(o?.value)}
                value={
                  departmentOptions.find((o) => o.value === field.value) || null
                }
              />
            </div>
          )}
        />
      </div>

      {/* Role / Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Controller
          name="role_id"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">
                Role
              </label>
              <Select
                {...field}
                options={roleOptions}
                onChange={(o) => field.onChange(o?.value)}
                value={roleOptions.find((o) => o.value === field.value) || null}
              />
              {errors.role_id && (
                <p className="text-red-500 text-sm">{errors.role_id.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Status</label>
              <Select
                {...field}
                options={statusOptions}
                onChange={(o) => field.onChange(o?.value)}
                value={
                  statusOptions.find((o) => o.value === field.value) || null
                }
              />
            </div>
          )}
        />
      </div>

      {/* Responsibilities */}
      <div>
        <label className="block text-sm font-medium">Responsibilities</label>
        <div className="flex gap-2">
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

      <footer className="flex justify-end gap-4 border-t pt-4">
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
      </footer>
    </form>
  );
};

export default EditUserForm;
