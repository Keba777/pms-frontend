"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { UpdatePaymentInput } from "@/types/financial";
import { useProjects } from "@/hooks/useProjects";
import { useSettingsStore } from "@/store/settingsStore";
import EtDatePicker from "habesha-datepicker"; 
import ReactDatePicker from "react-datepicker";

interface EditPaymentFormProps {
  onSubmit: (data: UpdatePaymentInput) => void;
  onClose: () => void;
  payment: UpdatePaymentInput;
}

const EditPaymentForm: React.FC<EditPaymentFormProps> = ({
  onSubmit,
  onClose,
  payment,
}) => {
  const { useEthiopianDate } = useSettingsStore();
  const { register, handleSubmit, control } = useForm<UpdatePaymentInput>({
    defaultValues: payment,
  });

  const { data: projects } = useProjects();

  const methodOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Mobile Money", label: "Mobile Money" },
  ];

  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.title,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Payment</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-red-500 hover:text-red-600"
        >
          ×
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Project</label>
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={projectOptions}
              className="flex-1"
              onChange={(option) => field.onChange(option?.value)}
              value={projectOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          {...register("amount", { min: 0 })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Method</label>
        <Controller
          name="method"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={methodOptions}
              className="flex-1"
              onChange={(option) => field.onChange(option?.value)}
              value={methodOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Date</label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <>
              {useEthiopianDate ? (
                <EtDatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date: any, event?: any) => {
                    const d = Array.isArray(date) ? date[0] : date;
                    field.onChange(d ? d.toISOString() : undefined);
                  }}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                  isRange={false}
                />
              ) : (
                <ReactDatePicker
                  showFullMonthYearPicker
                  showYearDropdown
                  selected={field.value ? new Date(field.value) : undefined}
                  onChange={(date: any, event?: any) => {
                    const d = Array.isArray(date) ? date[0] : date;
                    field.onChange(d ? d.toISOString() : undefined);
                  }}
                  placeholderText="Enter Date"
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                />
              )}
            </>
          )}
        />
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Close</button>
        <button type="submit" className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary">Update</button>
      </div>
    </form>
  );
};

export default EditPaymentForm;
