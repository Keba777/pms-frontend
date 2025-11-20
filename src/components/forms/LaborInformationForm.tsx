"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateLaborInput } from "@/types/labor";
import { useImportLabors } from "@/hooks/useLabors";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

interface LaborFormProps {
  siteId: string;
  onClose: () => void;
}

type FormData = CreateLaborInput & {
  firstName?: string;
  lastName?: string;
  position?: string;
  sex?: string;
  terms?: string;
  estSalary?: number;
  educationLevel?: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
  infoStatus?: "Allocated" | "Unallocated" | "OnLeave";
};

const LaborForm: React.FC<LaborFormProps> = ({ siteId, onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>();

  const { mutateAsync: importLabors, isPending } = useImportLabors();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  // Auto-calculate totalAmount = minQuantity * estimatedHours * rate
  const minQuantity = watch("minQuantity") ?? 0;
  const estimatedHours = watch("estimatedHours") ?? 0;
  const rate = watch("rate") ?? 0;

  useEffect(() => {
    const total = Number(minQuantity) * Number(estimatedHours) * Number(rate);
    setValue("totalAmount", total);
  }, [minQuantity, estimatedHours, rate, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();

      // Build laborObj similar to handleImport
      const laborObj: any = {
        role: (data.role || "").trim(),
        unit: data.unit,
        siteId,
      };

      // Numeric fields
      const numberFields = [
        "quantity",
        "minQuantity",
        "estimatedHours",
        "rate",
        "overtimeRate",
        "totalAmount",
      ];
      numberFields.forEach((nf) => {
        const val = data[nf as keyof FormData];
        if (val !== undefined && val !== null && val !== "") {
          const num = Number(val);
          if (!isNaN(num)) laborObj[nf] = num;
        }
      });

      // Date fields for labor
      if (data.startingDate) {
        const d = new Date(data.startingDate);
        if (!isNaN(d.getTime())) laborObj.startingDate = d.toISOString();
      }
      if (data.dueDate) {
        const d = new Date(data.dueDate);
        if (!isNaN(d.getTime())) laborObj.dueDate = d.toISOString();
      }

      // Optional fields
      if (data.allocationStatus) laborObj.allocationStatus = data.allocationStatus;

      // Build info
      const info: any = {};
      if (data.firstName) info.firstName = data.firstName;
      if (data.lastName) info.lastName = data.lastName;
      if (data.position) info.position = data.position;
      if (data.sex) info.sex = data.sex;
      if (data.terms) info.terms = data.terms;
      if (data.estSalary !== undefined && data.estSalary !== null) {
        const num = Number(data.estSalary);
        if (!isNaN(num)) info.estSalary = num;
      }
      if (data.educationLevel) info.educationLevel = data.educationLevel;
      if (data.startsAt) {
        const d = new Date(data.startsAt);
        if (!isNaN(d.getTime())) info.startsAt = d.toISOString();
      }
      if (data.endsAt) {
        const d = new Date(data.endsAt);
        if (!isNaN(d.getTime())) info.endsAt = d.toISOString();
      }
      if (data.infoStatus) info.status = data.infoStatus;

      // Handle profile picture
      if (selectedFile) {
        formData.append("files", selectedFile);
        info.fileName = selectedFile.name;
      }

      // Attach info if present
      if (Object.keys(info).length > 0) {
        laborObj.laborInformations = [info];
      }

      // Append labors JSON (array with one)
      formData.append("labors", JSON.stringify([laborObj]));

      await importLabors(formData);
      toast.success("Labor created successfully!");
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error("Create error:", err);
      toast.error(err.message || "Failed to create labor");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Labor</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          ×
        </button>
      </div>+

      <div className="space-y-4">
        {/* Labor Details Section */}
        <h4 className="text-md font-semibold text-gray-800">Labor Details</h4>

        {/* 1. Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("role", { required: "Role is required" })}
            placeholder="Enter Role"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        {/* 2. Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("unit", { required: "Unit is required" })}
            placeholder="Enter Unit (e.g., hrs)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
          )}
        </div>

        {/* 3. Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="Enter Quantity"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* 4. Min Quantity, 5. Estimated Hours, 6. Rate, 7. Overtime Rate */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("minQuantity", {
                required: "Minimum quantity is required",
                valueAsNumber: true,
              })}
              placeholder="Enter Min Quantity"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.minQuantity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.minQuantity.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("estimatedHours", {
                required: "Estimated hours are required",
                valueAsNumber: true,
              })}
              placeholder="Enter Estimated Hours"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.estimatedHours && (
              <p className="text-red-500 text-sm mt-1">
                {errors.estimatedHours.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("rate", {
                  required: "Rate is required",
                  valueAsNumber: true,
                })}
                placeholder="Enter Rate"
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
            {errors.rate && (
              <p className="text-red-500 text-sm mt-1">{errors.rate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overtime Rate
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("overtimeRate", { valueAsNumber: true })}
                placeholder="Enter Overtime Rate"
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
          </div>
        </div>

        {/* 8. Total Amount (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
              ETB
            </span>
            <input
              type="number"
              {...register("totalAmount", { valueAsNumber: true })}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-100 border rounded-r-md focus:outline-none"
            />
          </div>
        </div>

        {/* 9. Allocation Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allocation Status
          </label>
          <select
            {...register("allocationStatus")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          >
            <option value="">Select Allocation Status</option>
            <option value="Allocated">Allocated</option>
            <option value="Unallocated">Unallocated</option>
            <option value="OnLeave">On Leave</option>
          </select>
        </div>

        {/* 10. Starting Date, 11. Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Date
            </label>
            <Controller
              name="startingDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select Starting Date (optional)"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select Due Date (optional)"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Labor Information Section */}
      <div className="space-y-4 mt-8">
        <h4 className="text-md font-semibold text-gray-800">Labor Information</h4>

        {/* First Name, Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              {...register("firstName")}
              placeholder="Enter First Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              {...register("lastName")}
              placeholder="Enter Last Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
        </div>

        {/* Position, Sex */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              {...register("position")}
              placeholder="Enter Position"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sex
            </label>
            <select
              {...register("sex")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Terms, Est Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms
            </label>
            <select
              {...register("terms")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            >
              <option value="">Select Terms</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Permanent">Permanent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Salary
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("estSalary", { valueAsNumber: true })}
                placeholder="Enter Estimated Salary"
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
          </div>
        </div>

        {/* Education Level, Info Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education Level
            </label>
            <input
              type="text"
              {...register("educationLevel")}
              placeholder="Enter Education Level"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Info Status
            </label>
            <select
              {...register("infoStatus")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            >
              <option value="">Select Info Status</option>
              <option value="Allocated">Allocated</option>
              <option value="Unallocated">Unallocated</option>
              <option value="OnLeave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Starts At, Ends At */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starts At
            </label>
            <Controller
              name="startsAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select Starts At (optional)"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ends At
            </label>
            <Controller
              name="endsAt"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select Ends At (optional)"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
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
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default LaborForm;