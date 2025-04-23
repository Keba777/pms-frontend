"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { UpdateEquipmentInput } from "@/types/equipment";

interface EditEquipmentFormProps {
  onSubmit: (data: UpdateEquipmentInput) => void;
  onClose: () => void;
  equipment: UpdateEquipmentInput;
}

const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({
  onSubmit,
  onClose,
  equipment,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateEquipmentInput>({
    defaultValues: equipment,
  });

  // Recompute totalAmount when minQuantity, estimatedHours or rate changes
  const minQuantity = watch("minQuantity");
  const estimatedHours = watch("estimatedHours");
  const rate = watch("rate");

  useEffect(() => {
    const q = Number(minQuantity || 0);
    const h = Number(estimatedHours || 0);
    const r = Number(rate || 0);
    setValue("totalAmount", q * h * r);
  }, [minQuantity, estimatedHours, rate, setValue]);

  const handleFormSubmit = (data: UpdateEquipmentInput) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Equipment</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>

      <input type="hidden" {...register("id")} />

      {/* Item */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Item<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("item", { required: "Item is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.item && (
        <p className="text-red-500 text-sm ml-32">{errors.item.message}</p>
      )}

      {/* Unit */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Unit<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("unit", { required: "Unit is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.unit && (
        <p className="text-red-500 text-sm ml-32">{errors.unit.message}</p>
      )}

      {/* Manufacturer & Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-4">
          <label className="w-32 text-sm font-medium text-gray-700">
            Manufacturer
          </label>
          <input
            type="text"
            {...register("manufacturer")}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>
        <div className="flex items-center space-x-4">
          <label className="w-32 text-sm font-medium text-gray-700">Year</label>
          <input
            type="text"
            {...register("year")}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>
      </div>

      {/* Min Quantity, Estimated Hours, Rate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4">
          <label className="w-32 text-sm font-medium text-gray-700">
            Min Quantity<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("minQuantity", {
              required: "Minimum quantity is required",
              valueAsNumber: true,
            })}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>
        {errors.minQuantity && (
          <p className="text-red-500 text-sm ml-32">
            {errors.minQuantity.message}
          </p>
        )}

        <div className="flex items-center space-x-4">
          <label className="w-32 text-sm font-medium text-gray-700">
            Estimated Hours<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("estimatedHours", {
              required: "Estimated hours are required",
              valueAsNumber: true,
            })}
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>
        {errors.estimatedHours && (
          <p className="text-red-500 text-sm ml-32">
            {errors.estimatedHours.message}
          </p>
        )}

        <div className="flex items-center space-x-4">
          <label className="w-32 text-sm font-medium text-gray-700">
            Rate<span className="text-red-500">*</span>
          </label>
          <div className="flex-1 flex">
            <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
              ETB
            </span>
            <input
              type="number"
              {...register("rate", {
                required: "Rate is required",
                valueAsNumber: true,
              })}
              className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
        </div>
        {errors.rate && (
          <p className="text-red-500 text-sm ml-32">{errors.rate.message}</p>
        )}
      </div>

      {/* Total Amount (Read-only) */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Total Amount
        </label>
        <div className="flex-1 flex">
          <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
            ETB
          </span>
          <input
            type="number"
            {...register("totalAmount")}
            readOnly
            className="flex-1 px-3 py-2 border rounded-r-md bg-gray-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default EditEquipmentForm;
