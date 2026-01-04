"use client";

import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { CreatePaymentInput } from "@/types/financial";
import { useCreatePayment, useInvoices } from "@/hooks/useFinancials";
import { useProjects } from "@/hooks/useProjects";
import ReactDatePicker from "react-datepicker";
import { useAuthStore } from "@/store/authStore";

interface PaymentFormProps {
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreatePaymentInput>();

  const { mutate: createPayment, isPending } = useCreatePayment();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const user = useAuthStore((s) => s.user);

  const selectedProjectId = watch("invoice_id" as any); // Temporarily using watch on project selection

  const [selectedProjectIdLocal, setSelectedProjectIdLocal] = useState<string | null>(null);

  const { mutate: logPayment, isPending: isLogging } = useCreatePayment();

  const onSubmit = (data: any) => {
    const payload: CreatePaymentInput = {
      ...data,
      recorded_by: user?.id || "",
    };
    logPayment(payload, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to log payment:", error),
    });
  };

  const methodOptions = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" },
    { value: "mobile_money", label: "Mobile Money" },
  ];

  const projectOptions = projects?.map((project) => ({
    value: project.id,
    label: project.title,
  })) || [];

  const filteredInvoices = useMemo(() => {
    if (!selectedProjectIdLocal || !invoices) return [];
    return invoices.filter(inv => inv.project_id === selectedProjectIdLocal);
  }, [selectedProjectIdLocal, invoices]);

  const invoiceOptions = filteredInvoices.map((inv) => ({
    value: inv.id,
    label: `IPC #${inv.id.substring(0, 5)} - ETB ${inv.net_amount.toLocaleString()} (${inv.status})`,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-2xl p-8 space-y-6 max-w-2xl w-full">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Log Project Payment</h3>
        </div>
        <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-red-500 transition-colors">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Step 1: Select Project</label>
          <Select
            options={projectOptions}
            isLoading={projectsLoading}
            placeholder="Select a project first..."
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '0.75rem',
                padding: '2px'
              })
            }}
            onChange={(selectedOption) => setSelectedProjectIdLocal(selectedOption?.value || null)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Step 2: Select IPC / Invoice <span className="text-red-500">*</span></label>
          <Controller
            name="invoice_id"
            control={control}
            rules={{ required: "Invoice is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={invoiceOptions}
                isLoading={invoicesLoading}
                isDisabled={!selectedProjectIdLocal}
                placeholder={selectedProjectIdLocal ? "Select an IPC to pay against..." : "Please select a project first"}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '2px'
                  })
                }}
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                value={invoiceOptions.find((option) => option.value === field.value)}
              />
            )}
          />
          {errors.invoice_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.invoice_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount Paid (ETB) <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="number"
              {...register("amount_paid", { required: "Amount is required", min: 0 })}
              className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
              placeholder="0.00"
            />
            <div className="absolute right-4 top-2.5 text-gray-400 font-bold text-xs">ETB</div>
          </div>
          {errors.amount_paid && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount_paid.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Date <span className="text-red-500">*</span></label>
          <Controller
            name="payment_date"
            control={control}
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <ReactDatePicker
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                placeholderText="Select Date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method <span className="text-red-500">*</span></label>
          <Controller
            name="method"
            control={control}
            rules={{ required: "Method is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={methodOptions}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '2px'
                  })
                }}
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                value={methodOptions.find((option) => option.value === field.value)}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reference Number</label>
          <input
            {...register("reference_number")}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
            placeholder="Check / TXN ID"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Reason / Remarks</label>
        <textarea
          {...register("reason")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          placeholder="e.g. Settlement for IPC #15..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
        <button type="submit" disabled={isLogging} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-emerald-100">
          {isLogging ? "Logging Transaction..." : "Complete Payment"}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
