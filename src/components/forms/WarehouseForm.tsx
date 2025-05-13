"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { CreateWarehouseInput } from "@/types/warehouse";
import { useCreateWarehouse } from "@/hooks/useWarehouses";

interface WarehouseFormProps {
  onClose: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWarehouseInput>();

  const { mutate: createWarehouse, isPending } = useCreateWarehouse();

  const onSubmit = (data: CreateWarehouseInput) => {
    createWarehouse(data, {
      onSuccess: () => {
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
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Create Warehouse
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
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("type", { required: "Type is required" })}
            placeholder="Enter warehouse type"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Owner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("owner", { required: "Owner is required" })}
            placeholder="Enter owner name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
          {errors.owner && (
            <p className="text-red-500 text-sm mt-1">{errors.owner.message}</p>
          )}
        </div>

        {/* Working Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Working Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register("workingStatus", {
              required: "Working status is required",
            })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          >
            <option value="">Select status</option>
            <option value="Operational">Operational</option>
            <option value="Non-Operational">Non-Operational</option>
          </select>
          {errors.workingStatus && (
            <p className="text-red-500 text-sm mt-1">
              {errors.workingStatus.message}
            </p>
          )}
        </div>

        {/* Approved By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approved By
          </label>
          <input
            type="text"
            {...register("approvedBy")}
            placeholder="Enter approver name (optional)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          />
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remark
          </label>
          <textarea
            {...register("remark")}
            placeholder="Enter remarks (optional)"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          ></textarea>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register("status", { required: "Status is required" })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          >
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
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

export default WarehouseForm;
