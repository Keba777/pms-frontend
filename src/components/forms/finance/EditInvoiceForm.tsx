// EditInvoiceForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import EtDatePicker from "habesha-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateInvoiceInput } from "@/types/financial";
import { useProjects } from "@/hooks/useProjects";  // Assuming hook for projects
import { useSettingsStore } from "@/store/settingsStore";

interface EditInvoiceFormProps {
  onSubmit: (data: UpdateInvoiceInput) => void;
  onClose: () => void;
  invoice: UpdateInvoiceInput;
}

const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({ onSubmit, onClose, invoice }) => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    register,
    handleSubmit,
    control,
  } = useForm<UpdateInvoiceInput>({ defaultValues: invoice });

  const { data: projects } = useProjects();

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
    { value: "Overdue", label: "Overdue" },
  ];

  const projectOptions = projects?.map((project) => ({
    value: project.id,
    label: project.title,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-xl p-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Invoice</h3>
        <button type="button" onClick={onClose} className="text-3xl text-red-500 hover:text-red-600">&times;</button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Project</label>
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <Select
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
        <label className="w-32 text-sm font-medium text-gray-700">Due Date</label>
        <Controller
          name="dueDate"
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

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={statusOptions}
              className="flex-1"
              onChange={(option) => field.onChange(option?.value)}
              value={statusOptions.find((o) => o.value === field.value)}
            />
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

export default EditInvoiceForm;