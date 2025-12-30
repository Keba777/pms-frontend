"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { CreateDispatchInput } from "@/types/dispatch";
import { useCreateDispatch } from "@/hooks/useDispatches";
import { useDispatchStore } from "@/store/dispatchStore";
import { formatDate as format } from "@/utils/dateUtils";
import { ArrowRight, Calendar } from "lucide-react";
import { useApprovals } from "@/hooks/useApprovals";
import { useSites } from "@/hooks/useSites";
import { Approval } from "@/types/approval";
import { Site } from "@/types/site";
import ReactDatePicker from "react-datepicker";

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
  } = useForm<CreateDispatchInput>({
    defaultValues: {
      status: "Pending",
    },
  });

  const { mutate: createDispatch, isPending } = useCreateDispatch();
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

  const dispatchedDateStr = watch("dispatchedDate");
  const estArrivalTimeStr = watch("estArrivalTime");

  useEffect(() => {
    const dispatchedDate = dispatchedDateStr ? new Date(dispatchedDateStr) : null;
    const estArrivalTime = estArrivalTimeStr ? new Date(estArrivalTimeStr) : null;
    if (dispatchedDate && estArrivalTime) {
      const diffTime = estArrivalTime.getTime() - dispatchedDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(diffDays.toString());
    } else {
      setDuration("");
    }
  }, [dispatchedDateStr, estArrivalTimeStr]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = e.target.value;
    setDuration(newDuration);
    const dispatchedDate = dispatchedDateStr ? new Date(dispatchedDateStr) : null;
    if (dispatchedDate && newDuration && !isNaN(Number(newDuration))) {
      const calculatedArrivalTime = new Date(dispatchedDate);
      calculatedArrivalTime.setDate(calculatedArrivalTime.getDate() + Number(newDuration));
      setValue("estArrivalTime" as any, calculatedArrivalTime ? calculatedArrivalTime.toISOString() : undefined);
    }
  };

  const onSubmit = (data: CreateDispatchInput) => {
    createDispatch(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Failed to create dispatch:", error);
      },
    });
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
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span>{format(lastDispatch.dispatchedDate)}</span>
                <ArrowRight size={16} className="mx-2" />
                <Calendar size={16} className="mr-1" />
                <span>{format(lastDispatch.estArrivalTime)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm">No dispatch history available</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispatched Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dispatchedDate"
              control={control}
              rules={{ required: "Dispatched date is required" }}
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
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </>
              )}
            />
            {errors.dispatchedDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dispatchedDate.message}
              </p>
            )}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Arrival Time <span className="text-red-500">*</span>
            </label>
            <Controller
              name="estArrivalTime"
              control={control}
              rules={{ required: "Estimated arrival time is required" }}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                      const dispatchedDate = dispatchedDateStr ? new Date(dispatchedDateStr) : null;
                      if (dispatchedDate && d) {
                        const diffTime = d.getTime() - dispatchedDate.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        setDuration(diffDays.toString());
                      }
                    }}
                    placeholderText="Enter Estimated Arrival Time"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </>
              )}
            />
            {errors.estArrivalTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.estArrivalTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
