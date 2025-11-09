// components/forms/resource/StoreRequisitionForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { CreateStoreRequisitionInput } from "@/types/storeRequisition";
import { useCreateStoreRequisition } from "@/hooks/useStoreRequisition";
import { useApprovals } from "@/hooks/useApprovals";
import { Approval } from "@/types/approval";

interface StoreRequisitionFormProps {
  onClose: () => void;
}

const StoreRequisitionForm: React.FC<StoreRequisitionFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateStoreRequisitionInput>({
    defaultValues: {
      description: "",
      unitOfMeasure: "",
      quantity: 0,
      remarks: "",
      approvalId: "",
    },
  });

  const { mutate: createStoreRequisition, isPending } = useCreateStoreRequisition();
  const {
    data: approvals,
    isLoading: approvalsLoading,
    error: approvalsError,
  } = useApprovals();

  const onSubmit = (data: CreateStoreRequisitionInput) => {
    console.log("Submitting store requisition:", data);
    createStoreRequisition(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create store requisition:", error);
        alert("Failed to create store requisition: " + error.message);
      },
    });
  };

  const approvalOptions =
    approvals?.map((approval: Approval) => ({
      value: approval.id,
      label: approval.request?.activity?.activity_name || approval.id, 
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 max-w-md"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Create Store Requisition</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        {/* Approval (Activity) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity <span className="text-red-500">*</span>
          </label>
          <Controller
            name="approvalId"
            control={control}
            rules={{ required: "Activity is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={approvalOptions}
                isLoading={approvalsLoading}
                className="w-full"
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                value={approvalOptions.find(
                  (option) => option.value === field.value
                )}
                placeholder="Select activity..."
              />
            )}
          />
          {errors.approvalId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.approvalId.message}
            </p>
          )}
          {approvalsError && (
            <p className="text-red-500 text-sm mt-1">Error loading activities</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", { required: "Description is required" })}
            placeholder="Enter description (e.g., resource details)..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Unit of Measure */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit of Measure <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("unitOfMeasure", {
              required: "Unit of measure is required",
            })}
            placeholder="Enter unit (e.g., kg, units, pieces)"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.unitOfMeasure && (
            <p className="text-red-500 text-sm mt-1">
              {errors.unitOfMeasure.message}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("quantity", {
              required: "Quantity is required",
              min: { value: 1, message: "Quantity must be at least 1" },
            })}
            placeholder="Enter quantity"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            {...register("remarks")}
            placeholder="Enter remarks..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            rows={3}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default StoreRequisitionForm;