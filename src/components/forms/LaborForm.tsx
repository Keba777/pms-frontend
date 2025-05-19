"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateLaborInput } from "@/types/labor";
import { useCreateLabor } from "@/hooks/useLabors";

interface LaborFormProps {
  siteId: string;
  onClose: () => void;
}

const LaborForm: React.FC<LaborFormProps> = ({ siteId, onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateLaborInput>();

  const { mutate: createLabor, isPending } = useCreateLabor();

  // Auto-calculate totalAmount = minQuantity * estimatedHours * rate
  const minQuantity = watch("minQuantity") ?? 0;
  const estimatedHours = watch("estimatedHours") ?? 0;
  const rate = watch("rate") ?? 0;

  useEffect(() => {
    const total = Number(minQuantity) * Number(estimatedHours) * Number(rate);
    setValue("totalAmount", total);
  }, [minQuantity, estimatedHours, rate, setValue]);

  const onSubmit = (data: CreateLaborInput) => {
    createLabor(
      { ...data, siteId },
      {
        onSuccess: () => {
          onClose();
          window.location.reload();
        },
      }
    );
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
          &times;
        </button>
      </div>

      <div className="space-y-4">
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

        {/* 9. Skill Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill Level
          </label>
          <input
            type="text"
            {...register("skill_level")}
            placeholder="Enter Skill Level (optional)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* 10. Allocation Status & 11. Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
