"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { CreateUserInput } from "@/types/user";
import { useCreateUser } from "@/hooks/useUsers";
import Image from "next/image";

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
      gender: 'Male',
    },
  });

  const { mutate: createUser, isPending } = useCreateUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
      .map((role) => ({ value: role.id as string, label: role.name })) || [];

  const statusOptions: SelectOption[] = [
    { value: "Active", label: "Active" },
    { value: "InActive", label: "InActive" },
  ];

  const genderOptions: SelectOption[] = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const termsOptions: SelectOption[] = [
    { value: "Part Time", label: "Part Time" },
    { value: "Contract", label: "Contract" },
    { value: "Temporary", label: "Temporary" },
    { value: "Permanent", label: "Permanent" },
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
    const formData = new FormData();
    // Append all fields to FormData
    // Since CreateUserInput structure is flat (mostly), we iterate.
    // However, react-hook-form data might differ slightly from FormData structure needed by backend if array/nested.
    
    // Manual mapping to be safe or iteration
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    if (data.username) formData.append("username", data.username);
    if (data.gender) formData.append("gender", data.gender);
    if (data.position) formData.append("position", data.position);
    if (data.terms) formData.append("terms", data.terms);
    if (data.joiningDate) formData.append("joiningDate", data.joiningDate.toString()); // check format
    if (data.estSalary) formData.append("estSalary", data.estSalary.toString());
    if (data.ot) formData.append("ot", data.ot.toString());
    
    // Optional fields
    // NOTE: Backend expects role_id for "role_id" column, but frontend was sending "role_name"? 
    // UserForm used "role_name" in hook form previously? 
    // Looking at controller: req.body has role_id. 
    // Looking at previous UserForm: name="role_name" in Controller but value was mapped to role.name?
    // Wait, previous UserForm hook used "useRegister" which targeted /auth/register? 
    // And auth/register calls createUser using req.body. 
    // Let's check UserForm previous code: 
    //   roleOptions map role.name as value. 
    //   Controller name="role_name".
    //   But CreateUserInput type has role_name: string.
    //   Backend createUser controller expects role_id OR we added logic to default if missing.
    //   Actually the backend createUser expects "role_id". 
    //   If the old usage was sending role_name, maybe the backend was finding it by name?
    //   Let's check backend createUser again... it extracts `role_id`.
    //   So sending `role_name` might have been failing or I missed where it was converted.
    //   Ah, wait, `useRegister` calls `/auth/register`. 
    //   The UserForm uses `useRegister`. 
    //   Let's assume we should send `role_id` if we have it, or `role_name` if the backend supports it.
    //   My backend update only touched defaults.
    //   The `roleOptions` currently use `role.name` as value. 
    //   I should probably switch to sending `role_id` if the backend expects it.
    //   The backend `createUser` controller extracts `role_id`. 
    //   So if I send `role_name` it will be undefined in `role_id` var unless I map it.
    //   BUT I added default logic: if `role_id` is missing, default to User.
    //   So if I send nothing/empty, it defaults. 
    //   So making it optional works perfectly.
    //   If the user selects a role, we should probably send the ID to be safe, or ensure validation passes.
    //   Current UserForm options: `value: role.name`. 
    //   I will change this to `value: role.id` to be correct, and name the field `role_id`?
    //   Or if I simply omit it, it defaults.
    
    // Let's stick to previous behavior but allow optional.
    // If I select a role, I want it to work. 
    // I will change role options to use ID as value, and key to role_id.
    
    if (data.role_name) {
         formData.append("role_id", data.role_name); 
    }

    if (data.siteId) formData.append("siteId", data.siteId);
    if (data.department_id) formData.append("department_id", data.department_id);
    if (data.status) formData.append("status", data.status);
    
    if (data.responsiblities) {
        data.responsiblities.forEach(r => formData.append("responsibilities[]", r));
    }

    if (selectedFile) {
        formData.append("profile_picture", selectedFile);
    }

    // Call createUser with FormData (cast to any or overload in hook)
    // My updated hook accepts FormData.
    createUser(formData as any, {
      onSuccess: (user) => {
        onClose();
        // window.location.reload(); // React query should handle invalidation
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

        {/* Profile Picture */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Profile Picture
           </label>
           {previewUrl && (
              <Image
                src={previewUrl}
                alt="Preview"
                width={80}
                height={80}
                className="rounded-full mb-2 object-cover"
              />
            )}
           <input
             type="file"
             accept="image/*"
             onChange={handleFileChange}
             className="w-full px-3 py-2 border rounded-md"
           />
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

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            {...register("username")}
            placeholder="Enter username (optional, auto-generated if blank)"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: "Gender is required" }}
            render={({ field }) => (
              <Select
                options={genderOptions}
                onChange={(opt) => field.onChange(opt?.value)}
                value={genderOptions.find((opt) => opt.value === field.value) || null}
              />
            )}
          />
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <input
            type="text"
            {...register("position")}
            placeholder="Enter position"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Terms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms
          </label>
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Select
                options={termsOptions}
                onChange={(opt) => field.onChange(opt?.value)}
                value={termsOptions.find((opt) => opt.value === field.value) || null}
              />
            )}
          />
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Joining Date
          </label>
          <input
            type="date"
            {...register("joiningDate")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Est Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Salary
          </label>
          <input
            type="number"
            step="0.01"
            {...register("estSalary")}
            placeholder="Enter estimated salary"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* OT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OT
          </label>
          <input
            type="number"
            step="0.01"
            {...register("ot")}
            placeholder="Enter OT"
            className="w-full px-3 py-2 border rounded-md"
          />
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
              Site
            </label>
            <Controller
              name="siteId"
              control={control}
              // rules={{ required: "Site is required" }} // Made Optional
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
              Role
            </label>
            <Controller
              name="role_name" // We are using this field key but value will be ID now
              control={control}
              // rules={{ required: "Role is required" }} // Made Optional
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
