"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { UpdatePaymentInput } from "@/types/financial";
import { useProjects } from "@/hooks/useProjects";
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

  const { register, handleSubmit, control } = useForm<UpdatePaymentInput>({
    defaultValues: payment,
  });

  const { data: projects } = useProjects();

  const methodOptions = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" },
    { value: "mobile_money", label: "Mobile Money" },
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

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Invoice Reference</label>
        <Controller
          name="invoice_id"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none"
            />
          )}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Amount Paid (ETB)</label>
        <input
          type="number"
          {...register("amount_paid", { min: 0 })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Payment Reason</label>
        <textarea
          {...register("reason")}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
          rows={2}
          placeholder="Update the reason for this payment..."
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Method</label>
        <Controller
          name="method"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={methodOptions}
              className="w-full"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  borderColor: '#e5e7eb',
                })
              }}
              onChange={(option) => field.onChange(option?.value)}
              value={methodOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Payment Date</label>
        <Controller
          name="payment_date"
          control={control}
          render={({ field }) => (
            <ReactDatePicker
              selected={field.value ? new Date(field.value) : undefined}
              onChange={(date: any) => {
                const d = Array.isArray(date) ? date[0] : date;
                field.onChange(d ? d.toISOString() : undefined);
              }}
              placeholderText="Select Date"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow shadow-sm"
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md shadow-emerald-100"
        >
          Update Record
        </button>
      </div>
    </form>
  );
};

export default EditPaymentForm;
