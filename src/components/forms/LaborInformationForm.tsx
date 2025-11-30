"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useImportLabors } from "@/hooks/useLabors";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { useSettingsStore } from "@/store/settingsStore";
import EtDatePicker from "habesha-datepicker"; 
import ReactDatePicker from "react-datepicker";

interface LaborFormProps {
  siteId: string;
  onClose: () => void;
}

type FormData = {
  role?: string;
  unit?: string;
  quantity?: number;
  minQuantity?: number;
  estimatedHours?: number;
  rate?: number;
  overtimeRate?: number;
  totalAmount?: number;
  skill_level?: string;
  allocationStatus?: "Allocated" | "Unallocated" | "OnLeave";
  status?: "Active" | "InActive";
  startingDate?: string;
  dueDate?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  sex?: string;
  terms?: string;
  estSalary?: number;
  educationLevel?: string;
  startsAt?: string;
  endsAt?: string;
  infoStatus?: "Allocated" | "Unallocated" | "OnLeave";
};

const LaborForm: React.FC<LaborFormProps> = ({ siteId, onClose }) => {
  const { useEthiopianDate } = useSettingsStore();
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

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();

      const laborObj: any = {
        role: (data.role || "").trim(),
        unit: data.unit,
        siteId,
      };

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

      if (data.startingDate) {
        laborObj.startingDate = data.startingDate;
      }
      if (data.dueDate) {
        laborObj.dueDate = data.dueDate;
      }

      if (data.allocationStatus) laborObj.allocationStatus = data.allocationStatus;

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
        info.startsAt = data.startsAt;
      }
      if (data.endsAt) {
        info.endsAt = data.endsAt;
      }
      if (data.infoStatus) info.status = data.infoStatus;

      if (selectedFile) {
        formData.append("files", selectedFile);
        info.fileName = selectedFile.name;
      }

      if (Object.keys(info).length > 0) {
        laborObj.laborInformations = [info];
      }

      formData.append("labors", JSON.stringify([laborObj]));

      await importLabors(formData);
      toast.success("Labor created successfully!");
      onClose();
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
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Labor</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-800">Labor Details</h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="Enter Quantity"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Level
          </label>
          <input
            type="text"
            {...register("skill_level")}
            placeholder="Enter Skill Level (optional)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="InActive">In Active</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Date
            </label>
            <Controller
              name="startingDate"
              control={control}
              render={({ field }) => (
                <>
                  {useEthiopianDate ? (
                    <EtDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
                      placeholderText="Enter Starting Date"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    />
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <>
                  {useEthiopianDate ? (
                    <EtDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
                      placeholderText="Enter Due Date"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    />
                  )}
                </>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-800">Labor Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starts At
            </label>
            <Controller
              name="startsAt"
              control={control}
              render={({ field }) => (
                <>
                  {useEthiopianDate ? (
                    <EtDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
                      placeholderText="Enter Starts At"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    />
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ends At
            </label>
            <Controller
              name="endsAt"
              control={control}
              render={({ field }) => (
                <>
                  {useEthiopianDate ? (
                    <EtDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date: any, event?: any) => {
                        const d = Array.isArray(date) ? date[0] : date;
                        field.onChange(d ? d.toISOString() : undefined);
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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
                      placeholderText="Enter Ends At"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                    />
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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