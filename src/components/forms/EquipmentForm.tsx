"use client";

import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { CreateEquipmentInput } from "@/types/equipment";
import { useCreateEquipment } from "@/hooks/useEquipments";
import DatePicker from "react-datepicker";

interface EquipmentFormProps {
  siteId: string;
  onClose: () => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ siteId, onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateEquipmentInput>();

  const { mutate: createEquipment, isPending } = useCreateEquipment();

  const minQuantity = watch("minQuantity") ?? 0;
  const hours = watch("estimatedHours") ?? 0;
  const rate = watch("rate") ?? 0;

  useEffect(() => {
    const total = Number(minQuantity) * Number(hours) * Number(rate);
    setValue("totalAmount", total);
  }, [minQuantity, hours, rate, setValue]);

  const onSubmit = (data: CreateEquipmentInput) => {
    createEquipment(
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
        <h3 className="text-lg font-semibold text-gray-800">
          Create Equipment
        </h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* 1. Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipment Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("item", { required: "Item is required" })}
            placeholder="Enter Item Name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.item && (
            <p className="text-red-500 text-sm mt-1">{errors.item.message}</p>
          )}
        </div>

        {/* 2. Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <input
            type="text"
            {...register("type")}
            placeholder="Enter Type (optional)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* 3. Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("unit", { required: "Unit is required" })}
            placeholder="Enter Unit (e.g., pcs, hrs)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
          )}
        </div>

        {/* 4–6. Manufacturer, Model, Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              {...register("manufacturer")}
              placeholder="Enter Manufacturer (optional)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              {...register("model")}
              placeholder="Enter Model (optional)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              {...register("year")}
              placeholder="Enter Year (optional)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
        </div>

        {/* 7. Quantity */}
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

        {/* 8. Minimum Quantity, 9. Reorder Quantity, 10. Estimated Hours, 11. Rate */}
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
              Reorder Quantity
            </label>
            <input
              type="number"
              {...register("reorderQuantity", { valueAsNumber: true })}
              placeholder="Enter Reorder Quantity"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
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
        </div>

        {/* 12. Total Amount (read-only) */}
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

        {/* 13. Overtime */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Overtime (hrs)
          </label>
          <input
            type="number"
            {...register("overTime", { valueAsNumber: true })}
            placeholder="Enter Overtime Hours"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* 14. Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <input
            type="text"
            {...register("condition")}
            placeholder="Enter Condition (e.g., New, Used)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* 15. Owner & 16. Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <select
              {...register("owner")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            >
              <option value="">Select Owner</option>
              <option value="Raycon">Raycon</option>
              <option value="Rental">Rental</option>
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
              <option value="Allocated">Allocated</option>
              <option value="Unallocated">Unallocated</option>
              <option value="OnMaintainance">On Maintainance</option>
              <option value="InActive">In Active</option>
            </select>
          </div>
        </div>
        {/* New Fields: Utilization Factor, Total Time, Starting Date, Due Date, Shifting Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilization Factor
            </label>
            <input
              type="number"
              step="0.01"
              {...register("utilization_factor", { valueAsNumber: true })}
              placeholder="Enter Utilization Factor (optional)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Time
            </label>
            <input
              type="number"
              step="0.01"
              {...register("totalTime", { valueAsNumber: true })}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border rounded-md focus:outline-none"
            />
          </div>
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shifting Date
            </label>
            <Controller
              name="shiftingDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={field.onChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select Shifting Date (optional)"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
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

export default EquipmentForm;
