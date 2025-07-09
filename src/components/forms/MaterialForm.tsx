"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateMaterialInput } from "@/types/material";
import { useCreateMaterial } from "@/hooks/useMaterials";

interface MaterialFormProps {
  warehouseId: string;
  onClose: () => void;
}

const MaterialForm: React.FC<MaterialFormProps> = ({
  warehouseId,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMaterialInput>();

  const { mutate: createMaterial, isPending } = useCreateMaterial();

  const onSubmit = (data: CreateMaterialInput) => {
    createMaterial(
      { ...data, warehouseId },
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
        <h3 className="text-lg font-semibold text-gray-800">Create Material</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Name <span className="text-red-500">*</span>
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

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <input
            type="text"
            {...register("type")}
            placeholder="Enter Material Type"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("unit", { required: "Unit is required" })}
            placeholder="Enter Unit (e.g., pcs, kg)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.unit && (
            <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
          )}
        </div>

        {/* Quantity, MinQuantity, ReorderQuantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity
            </label>
            <input
              type="number"
              {...register("minQuantity", { valueAsNumber: true })}
              placeholder="Enter Minimum Quantity"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
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
        </div>

        {/* Rate and Shelf No */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                ETB
              </span>
              <input
                type="number"
                {...register("rate", { valueAsNumber: true })}
                placeholder="Enter Rate"
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shelf No
            </label>
            <input
              type="text"
              {...register("shelfNo")}
              placeholder="Enter Shelf Number"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Controller
            control={control}
            name="status"
            defaultValue="Unallocated"
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              >
                <option value="Allocated">Allocated</option>
                <option value="Unallocated">Unallocated</option>
              </select>
            )}
          />
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
      </div>
    </form>
  );
};

export default MaterialForm;
