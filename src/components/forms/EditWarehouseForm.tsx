"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Warehouse } from "@/types/warehouse";

interface EditWarehouseFormProps {
  onSubmit: (data: Warehouse) => void;
  onClose: () => void;
  warehouse: Warehouse;
}

const EditWarehouseForm: React.FC<EditWarehouseFormProps> = ({
  onSubmit,
  onClose,
  warehouse,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Warehouse>({
    defaultValues: warehouse,
  });

  const handleFormSubmit = (data: Warehouse) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Warehouse</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <input type="hidden" {...register("id")} />

      {/* Type */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Type<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("type", { required: "Type is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.type && (
        <p className="text-red-500 text-sm ml-32">{errors.type.message}</p>
      )}

      {/* Owner */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Owner<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("owner", { required: "Owner is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.owner && (
        <p className="text-red-500 text-sm ml-32">{errors.owner.message}</p>
      )}

      {/* Working Status */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Working Status<span className="text-red-500">*</span>
        </label>
        <select
          {...register("workingStatus", {
            required: "Working status is required",
          })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        >
          <option value="">Select status</option>
          <option value="Operational">Operational</option>
          <option value="Non-Operational">Non-Operational</option>
        </select>
      </div>
      {errors.workingStatus && (
        <p className="text-red-500 text-sm ml-32">
          {errors.workingStatus.message}
        </p>
      )}

      {/* Current Working Site */}
      {/* <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Current Site<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("currentWorkingSite", {
            required: "Current working site is required",
          })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.currentWorkingSite && (
        <p className="text-red-500 text-sm ml-32">
          {errors.currentWorkingSite.message}
        </p>
      )} */}

      {/* Approved By (optional) */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Approved By
        </label>
        <input
          type="text"
          {...register("approvedBy")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Remark (optional) */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Remark</label>
        <textarea
          {...register("remark")}
          rows={2}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Status */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Status<span className="text-red-500">*</span>
        </label>
        <select
          {...register("status", { required: "Status is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        >
          <option value="">Select status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Under Maintenance">Under Maintenance</option>
        </select>
      </div>
      {errors.status && (
        <p className="text-red-500 text-sm ml-32">{errors.status.message}</p>
      )}

      {/* Buttons */}
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

export default EditWarehouseForm;
