// PaymentForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CreatePaymentInput } from "@/types/financial";
import { useCreatePayment } from "@/hooks/useFinancials";
import { useProjects } from "@/hooks/useProjects";

interface PaymentFormProps {
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePaymentInput>();

  const { mutate: createPayment, isPending } = useCreatePayment();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const onSubmit = (data: CreatePaymentInput) => {
    createPayment(data, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to create payment:", error),
    });
  };

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
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Create Payment</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-red-500 hover:text-red-600"
        >
          &times;
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project <span className="text-red-500">*</span>
        </label>
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
        {errors.projectId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.projectId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("amount", { required: "Amount is required", min: 0 })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Method <span className="text-red-500">*</span>
        </label>
        <Controller
          name="method"
          control={control}
          rules={{ required: "Method is required" }}
          render={({ field }) => (
            <Select
              options={methodOptions}
              onChange={(option) => field.onChange(option?.value)}
              value={methodOptions.find((o) => o.value === field.value)}
            />
          )}
        />
        {errors.method && (
          <p className="text-red-500 text-sm mt-1">{errors.method.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date <span className="text-red-500">*</span>
        </label>
        <Controller
          name="date"
          control={control}
          rules={{ required: "Date is required" }}
          render={({ field }) => (
            <DatePicker
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
              dateFormat="MM/dd/yyyy"
            />
          )}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Close
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
