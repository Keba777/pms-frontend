"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateDispatchInput } from "@/types/dispatch";
import { useApprovals } from "@/hooks/useApprovals";
import { useSites } from "@/hooks/useSites";
import { Approval } from "@/types/approval";
import { Site } from "@/types/site";
import ReactDatePicker from "react-datepicker";

interface EditDispatchFormProps {
  onSubmit: (data: UpdateDispatchInput) => void;
  onClose: () => void;
  dispatch: UpdateDispatchInput & { status?: "Pending" | "In Transit" | "Delivered" | "Cancelled" };
}

const EditDispatchForm: React.FC<EditDispatchFormProps> = ({
  onSubmit,
  onClose,
  dispatch,
}) => {

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateDispatchInput>({
    defaultValues: dispatch,
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

  const [duration, setDuration] = useState<string>("");

  const dispatchedDateStr = watch("dispatchedDate");
  const estArrivalTimeStr = watch("estArrivalTime");

  useEffect(() => {
    const dispatchedDate = dispatchedDateStr ? new Date(dispatchedDateStr) : null;
    const estArrivalTime = estArrivalTimeStr ? new Date(estArrivalTimeStr) : null;
    if (dispatchedDate && estArrivalTime) {
      const diffTime = estArrivalTime.getTime() - dispatchedDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  }, [dispatchedDateStr, estArrivalTimeStr]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    const dispatchedDate = dispatchedDateStr ? new Date(dispatchedDateStr) : null;
    if (dispatchedDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedArrivalTime = new Date(dispatchedDate);
      calculatedArrivalTime.setDate(calculatedArrivalTime.getDate() + Number(newDuration));
      setValue("estArrivalTime", calculatedArrivalTime ? calculatedArrivalTime : undefined);
    }
  };

  const onSubmitHandler = (data: UpdateDispatchInput) => {
    onSubmit(data);
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "In Transit", label: "In Transit" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const dispatchedByOptions = [
    { value: "Plane", label: "Plane" },
    { value: "Truck", label: "Truck" },
  ];

  const approvalOptions =
    approvals?.map((approval: Approval) => ({
      value: approval.id,
      label: approval.request?.activity?.activity_name || `${approval.id}`,
    })) || [];

  const siteOptions =
    sites?.map((site: Site) => ({
      value: site.id,
      label: site.name || `Site ${site.id}`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Dispatch</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

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

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Ref Number</label>
        <input
          type="text"
          {...register("refNumber")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Total Transport Cost</label>
        <input
          type="number"
          {...register("totalTransportCost", { valueAsNumber: true })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Status
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={statusOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={statusOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Dispatched By</label>
        <Controller
          name="dispatchedBy"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={dispatchedByOptions}
              className="flex-1"
              onChange={(selectedOption) => field.onChange(selectedOption?.value)}
              value={dispatchedByOptions.find(option => option.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Dispatched Date</label>
        <Controller
          name="dispatchedDate"
          control={control}
          render={({ field }) => (
            <>
              <ReactDatePicker
                showFullMonthYearPicker
                showYearDropdown
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any, event?: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                placeholderText="Enter Dispatched Date"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </>
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Duration (days)</label>
        <input
          type="number"
          value={duration}
          onChange={handleDurationChange}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Est. Arrival Time</label>
        <Controller
          name="estArrivalTime"
          control={control}
          render={({ field }) => (
            <>
              <ReactDatePicker
                showFullMonthYearPicker
                showYearDropdown
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any, event?: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                placeholderText="Enter Est. Arrival Time"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
              />
            </>
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Departure Site</label>
        <Controller
          name="depatureSiteId"
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

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Arrival Site</label>
        <Controller
          name="arrivalSiteId"
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

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Driver Name</label>
        <input
          type="text"
          {...register("driverName")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Vehicle Number</label>
        <input
          type="text"
          {...register("vehicleNumber")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Vehicle Type</label>
        <input
          type="text"
          {...register("vehicleType")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

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

export default EditDispatchForm;