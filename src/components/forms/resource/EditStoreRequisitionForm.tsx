"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { UpdateStoreRequisitionInput } from "@/types/storeRequisition";
import { useApprovals } from "@/hooks/useApprovals";
import { Approval } from "@/types/approval";

interface EditStoreRequisitionFormProps {
  onSubmit: (data: UpdateStoreRequisitionInput) => void;
  onClose: () => void;
  storeRequisition: UpdateStoreRequisitionInput;
}

const EditStoreRequisitionForm: React.FC<EditStoreRequisitionFormProps> = ({
  onSubmit,
  onClose,
  storeRequisition,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateStoreRequisitionInput>({
    defaultValues: storeRequisition,
  });

  const {
    data: approvals,
    isLoading: approvalsLoading,
    error: approvalsError,
  } = useApprovals();

  const approvalOptions =
    approvals?.map((approval: Approval) => ({
      value: approval.id,
      label: approval.request?.activity?.activity_name || approval.id,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Store Requisition</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Approval (Activity) */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Activity</label>
        <Controller
          name="approvalId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={approvalOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={approvalOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      {/* Description */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Unit of Measure */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Unit of Measure</label>
        <input
          type="text"
          {...register("unitOfMeasure")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Quantity */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          {...register("quantity", { valueAsNumber: true })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Remarks */}
      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Remarks</label>
        <textarea
          {...register("remarks")}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex justify-end space-x-4 mt-4">
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
    </form>
  );
};

export default EditStoreRequisitionForm;
