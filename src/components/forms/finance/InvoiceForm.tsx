// InvoiceForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreateInvoiceInput } from "@/types/financial";
import { useCreateInvoice } from "@/hooks/useFinancials";
import { useProjects } from "@/hooks/useProjects";  // Assuming hook for projects

interface InvoiceFormProps {
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateInvoiceInput>();

  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const onSubmit = (data: CreateInvoiceInput) => {
    createInvoice(data, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to create invoice:", error),
    });
  };

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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-xl p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Create Invoice</h3>
        <button type="button" onClick={onClose} className="text-3xl text-red-500 hover:text-red-600">&times;</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
        <Controller
          name="projectId"
          control={control}
          rules={{ required: "Project is required" }}
          render={({ field }) => (
            <Select
              options={projectOptions}
              isLoading={projectsLoading}
              onChange={(option) => field.onChange(option?.value)}
              value={projectOptions.find((o) => o.value === field.value)}
            />
          )}
        />
        {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amount <span className="text-red-500">*</span></label>
        <input
          type="number"
          {...register("amount", { required: "Amount is required", min: 0 })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date <span className="text-red-500">*</span></label>
        <Controller
          name="dueDate"
          control={control}
          rules={{ required: "Due date is required" }}
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
              dateFormat="MM/dd/yyyy"
            />
          )}
        />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={statusOptions}
              onChange={(option) => field.onChange(option?.value)}
              value={statusOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Close</button>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800">
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
