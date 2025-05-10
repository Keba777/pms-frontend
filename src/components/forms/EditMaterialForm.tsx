"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { UpdateMaterialInput } from "@/types/material";
import { useWarehouses } from "@/hooks/useWarehouses";

interface EditMaterialFormProps {
  material: UpdateMaterialInput;
  onSubmit: (data: UpdateMaterialInput) => void;
  onClose: () => void;
}

const EditMaterialForm: React.FC<EditMaterialFormProps> = ({
  material,
  onSubmit,
  onClose,
}) => {
  const { data: warehouses, isLoading: whLoading } = useWarehouses();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<UpdateMaterialInput>({ defaultValues: material });

  // Auto-calculate totalAmount = minQuantity * rate
  const minQuantity = watch("minQuantity");
  const rate = watch("rate");

  useEffect(() => {
    const q = Number(minQuantity || 0);
    const r = Number(rate || 0);
    setValue("totalAmount", q * r);
  }, [minQuantity, rate, setValue]);

  const submitHandler = (data: UpdateMaterialInput) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Edit Material</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <input type="hidden" {...register("id")} />

      <div className="space-y-4">
        {/* Warehouse Site Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse Site
          </label>
          {!whLoading && warehouses && (
            <Controller
              control={control}
              name="warehouseId"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                >
                  <option value="">Select Warehouse Site (optional)</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.currentWorkingSite}
                    </option>
                  ))}
                </select>
              )}
            />
          )}
        </div>

        {/* Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("item", { required: "Item is required" })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.item && (
            <p className="text-red-500 text-sm mt-1">{errors.item.message}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("unit", { required: "Unit is required" })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
          )}
        </div>

        {/* Min Quantity & Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("minQuantity", {
                required: "Minimum quantity is required",
                valueAsNumber: true,
              })}
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
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
            {errors.rate && (
              <p className="text-red-500 text-sm mt-1">{errors.rate.message}</p>
            )}
          </div>
        </div>

        {/* Total Amount (Read-only) */}
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
              {...register("totalAmount")}
              readOnly
              className="flex-1 px-3 py-2 border rounded-r-md bg-gray-100 focus:outline-none"
            />
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
          >
            Update
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditMaterialForm;
