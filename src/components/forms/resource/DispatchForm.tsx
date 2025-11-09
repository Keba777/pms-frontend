"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateDispatchInput } from "@/types/dispatch";
import { useCreateDispatch } from "@/hooks/useDispatches";
import { useDispatchStore } from "@/store/dispatchStore";
import { formatDate } from "@/utils/helper";
import { ArrowRight, Calendar } from "lucide-react";
import { useApprovals } from "@/hooks/useApprovals";
import { useSites } from "@/hooks/useSites";
import { Approval } from "@/types/approval";
import { Site } from "@/types/site";

interface DispatchFormProps {
  onClose: () => void;
}

const DispatchForm: React.FC<DispatchFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<
    CreateDispatchInput & {
      status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
    }
  >({
    defaultValues: {
      status: "Pending",
    },
  });

  const { mutate: createDispatch, isPending } = useCreateDispatch();
  // Retrieve dispatches from the store to show the last created dispatch
  const { dispatches } = useDispatchStore();
  const lastDispatch =
    dispatches && dispatches.length > 0
      ? dispatches[dispatches.length - 1]
      : null;
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

  const dispatchedDate = watch("dispatchedDate");
  const estArrivalTime = watch("estArrivalTime");

  useEffect(() => {
    if (dispatchedDate && estArrivalTime) {
      const diffTime =
        new Date(estArrivalTime).getTime() - new Date(dispatchedDate).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    }
  }, [dispatchedDate, estArrivalTime]);

  // When the user types in the duration field, update the estArrivalTime automatically.
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    // If a valid dispatched date exists and duration is a valid number, update the estArrivalTime.
    if (dispatchedDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedArrivalTime = new Date(dispatchedDate);
      calculatedArrivalTime.setDate(
        calculatedArrivalTime.getDate() + Number(newDuration)
      );
      setValue("estArrivalTime", calculatedArrivalTime);
    }
  };

  const onSubmit = (
    data: CreateDispatchInput & {
      status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
    }
  ) => {
    const submitData = { ...data };
    console.log("Submitting dispatch:", submitData);

    createDispatch(submitData, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create dispatch:", error);
        alert("Failed to create dispatch: " + error.message);
      },
    });
  };

  const statusOptions = [
    {
      value: "Pending",
      label: "Pending",
      className: "bg-bs-warning-100 text-bs-warning",
    },
    {
      value: "In Transit",
      label: "In Transit",
      className: "bg-bs-secondary-100 text-bs-secondary",
    },
    {
      value: "Delivered",
      label: "Delivered",
      className: "bg-bs-success-100 text-bs-success",
    },
    {
      value: "Cancelled",
      label: "Cancelled",
      className: "bg-bs-danger-100 text-bs-danger",
    },
  ];

  const dispatchedByOptions = [
    { value: "Plane", label: "Plane" },
    { value: "Truck", label: "Truck" },
  ];

  const approvalOptions =
    approvals?.map((approval: Approval) => ({
      value: approval.id,
      label: approval.approvedByUser
        ? `${approval.request?.activity?.activity_name}`
        : `${approval.id}`, 
    })) || [];

  const siteOptions =
    sites?.map((site: Site) => ({
      value: site.id,
      label: site.name || `Site ${site.id}`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Create Dispatch</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        {/* Approval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity <span className="text-red-500">*</span>
          </label>
          <Controller
            name="approvalId"
            control={control}
            rules={{ required: "Approval is required" }}
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
              />
            )}
          />
          {errors.approvalId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.approvalId.message}
            </p>
          )}
          {approvalsError && (
            <p className="text-red-500 text-sm mt-1">Error loading approvals</p>
          )}
        </div>

        {/* Ref Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number
          </label>
          <input
            type="text"
            {...register("refNumber")}
            placeholder="Enter Reference Number"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div>

        {/* Total Transport Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Transport Cost <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("totalTransportCost", {
              required: "Total Transport Cost is required",
              min: 0,
            })}
            placeholder="Enter Total Transport Cost"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.totalTransportCost && (
            <p className="text-red-500 text-sm mt-1">
              {errors.totalTransportCost.message}
            </p>
          )}
        </div>

        {/* Status and Dispatched By Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={statusOptions}
                  className="w-full"
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
          {/* Dispatched By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispatched By
            </label>
            <Controller
              name="dispatchedBy"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={dispatchedByOptions}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={dispatchedByOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
          </div>
        </div>

        {/* Latest Dispatch History Card */}
        <div className="p-4 rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">
          <h4 className="text-lg font-semibold mb-2">Latest Dispatch</h4>
          {lastDispatch ? (
            <div>
              <p className="font-medium flex items-center">
                <Calendar size={16} className="mr-2" />
                {lastDispatch.refNumber || "Dispatch " + lastDispatch.id}
              </p>
              <div className="flex items-center text-sm mt-1">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(lastDispatch.dispatchedDate)}</span>
                <ArrowRight size={16} className="mx-2" />
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(lastDispatch.estArrivalTime)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm">No dispatch history available</p>
          )}
        </div>

        {/* Dates Section with Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dispatched Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispatched Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dispatchedDate"
              control={control}
              rules={{ required: "Dispatched date is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.dispatchedDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dispatchedDate.message}
              </p>
            )}
          </div>

          {/* Duration Field (Optional - Not Submitted) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (days) <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={handleDurationChange}
              placeholder="Enter duration in days"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            />
          </div>

          {/* Estimated Arrival Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Arrival Time <span className="text-red-500">*</span>
            </label>
            <Controller
              name="estArrivalTime"
              control={control}
              rules={{ required: "Estimated arrival time is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => {
                    field.onChange(date);
                    if (dispatchedDate && date) {
                      const diffTime =
                        new Date(date).getTime() -
                        new Date(dispatchedDate).getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      setDuration(diffDays.toString());
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  dateFormat="MM/dd/yyyy"
                  showYearDropdown
                  scrollableYearDropdown
                />
              )}
            />
            {errors.estArrivalTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.estArrivalTime.message}
              </p>
            )}
          </div>
        </div>

        {/* Sites Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure Site */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure Site <span className="text-red-500">*</span>
            </label>
            <Controller
              name="depatureSiteId"
              control={control}
              rules={{ required: "Departure site is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={siteOptions}
                  isLoading={sitesLoading}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={siteOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
            {errors.depatureSiteId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.depatureSiteId.message}
              </p>
            )}
            {sitesError && (
              <p className="text-red-500 text-sm mt-1">Error loading sites</p>
            )}
          </div>

          {/* Arrival Site */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arrival Site <span className="text-red-500">*</span>
            </label>
            <Controller
              name="arrivalSiteId"
              control={control}
              rules={{ required: "Arrival site is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={siteOptions}
                  isLoading={sitesLoading}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={siteOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
            {errors.arrivalSiteId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.arrivalSiteId.message}
              </p>
            )}
            {sitesError && (
              <p className="text-red-500 text-sm mt-1">Error loading sites</p>
            )}
          </div>
        </div>

        {/* Driver Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Driver Name
          </label>
          <input
            type="text"
            {...register("driverName")}
            placeholder="Enter Driver Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div>

        {/* Vehicle Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Number
          </label>
          <input
            type="text"
            {...register("vehicleNumber")}
            placeholder="Enter Vehicle Number"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type
          </label>
          <input
            type="text"
            {...register("vehicleType")}
            placeholder="Enter Vehicle Type"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            {...register("remarks")}
            placeholder="Enter Remarks"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
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

export default DispatchForm;
