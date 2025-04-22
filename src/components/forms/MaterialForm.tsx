"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CreateMaterialInput } from "@/types/material";
import { useCreateMaterial } from "@/hooks/useMaterials";
import { toast } from "react-toastify";

interface MaterialFormProps {
  onClose: () => void; // Function to close the modal
}

const MaterialForm: React.FC<MaterialFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateMaterialInput>();

  const { mutate: createMaterial, isPending } = useCreateMaterial();

  // Watch fields to compute totalAmount
  const requestQuantity = watch("requestQuantity");
  const rate = watch("rate");

  useEffect(() => {
    const qty = Number(requestQuantity || 0);
    const r = Number(rate || 0);
    setValue("totalAmount", qty * r);
  }, [requestQuantity, rate, setValue]);

  const onSubmit = (data: CreateMaterialInput) => {
    createMaterial(data, {
      onSuccess: () => {
        toast.success("Material created successfully!");
        onClose();
        window.location.reload();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Material</h3>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* Activity ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("activityId", { required: "Activity ID is required" })}
            placeholder="Enter Activity ID"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.activityId && <p className="text-red-500 text-sm mt-1">{errors.activityId.message}</p>}
        </div>

        {/* Request ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("requestId", { required: "Request ID is required" })}
            placeholder="Enter Request ID"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.requestId && <p className="text-red-500 text-sm mt-1">{errors.requestId.message}</p>}
        </div>

        {/* Warehouse ID (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warehouse ID
          </label>
          <input
            type="text"
            {...register("warehouseId")}
            placeholder="Enter Warehouse ID (optional)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* Item and Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("item", { required: "Item is required" })}
              placeholder="Enter Item Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.item && <p className="text-red-500 text-sm mt-1">{errors.item.message}</p>}
          </div>

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
            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>}
          </div>
        </div>

        {/* Quantities and Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("requestQuantity", { required: "Requested quantity is required", valueAsNumber: true })}
              placeholder="Enter Requested Quantity"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.requestQuantity && <p className="text-red-500 text-sm mt-1">{errors.requestQuantity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register("minQuantity", { required: "Minimum quantity is required", valueAsNumber: true })}
              placeholder="Enter Minimum Quantity"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
            {errors.minQuantity && <p className="text-red-500 text-sm mt-1">{errors.minQuantity.message}</p>}
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
                {...register("rate", { required: "Rate is required", valueAsNumber: true })}
                placeholder="Enter Rate"
                className="flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </div>
            {errors.rate && <p className="text-red-500 text-sm mt-1">{errors.rate.message}</p>}
          </div>

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
                placeholder="0"
                readOnly
                className="flex-1 px-3 py-2 border rounded-r-md bg-gray-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
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
