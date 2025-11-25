"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import EtDatePicker from "habesha-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateRequestDeliveryInput } from "@/types/requestDelivery";
import { useApprovals } from "@/hooks/useApprovals";
import { useSites } from "@/hooks/useSites";
import { Approval } from "@/types/approval";
import { Site } from "@/types/site";
import { useSettingsStore } from "@/store/settingsStore";

interface EditRequestDeliveryFormProps {
  onSubmit: (data: UpdateRequestDeliveryInput) => void;
  onClose: () => void;
  requestDelivery: UpdateRequestDeliveryInput;
}

const EditRequestDeliveryForm: React.FC<EditRequestDeliveryFormProps> = ({
  onSubmit,
  onClose,
  requestDelivery,
}) => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateRequestDeliveryInput>({
    defaultValues: requestDelivery,
  });

  const {
    data: approvals,
    isLoading: approvalsLoading,
    error: approvalsError,
  } = useApprovals();
  const {
    data: sites,
    isLoading: sitesLoading,
    error: sitesError,
  } = useSites();

  const approvalOptions =
    approvals?.map((approval: Approval) => ({
      value: approval.id,
      label: approval.request?.activity?.activity_name || approval.id,
    })) || [];

  const siteOptions =
    sites?.map((site: Site) => ({
      value: site.id,
      label: site.name || `Site ${site.id}`,
    })) || [];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Request Delivery</h3>
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

      {/* Ref Number */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Ref Number</label>
        <input
          type="text"
          {...register("refNumber")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Received Quantity */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Received Quantity</label>
        <input
          type="number"
          {...register("recievedQuantity", { valueAsNumber: true })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Delivered By */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Delivered By</label>
        <input
          type="text"
          {...register("deliveredBy")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Received By */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Received By</label>
        <input
          type="text"
          {...register("recievedBy")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Delivery Date */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Delivery Date</label>
        <Controller
          name="deliveryDate"
          control={control}
          render={({ field }) => (
            <EtDatePicker
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            />
          )}
        />
      </div>

      {/* Site */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Site</label>
        <Controller
          name="siteId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={siteOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={siteOptions.find(option => option.value === field.value)}
            />
          )}
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

      {/* Status */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={statusOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={statusOptions.find(option => option.value === field.value)}
            />
          )}
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

export default EditRequestDeliveryForm;