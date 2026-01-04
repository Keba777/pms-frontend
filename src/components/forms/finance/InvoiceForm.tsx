"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { CreateInvoiceInput } from "@/types/financial";
import { useCreateInvoice } from "@/hooks/useFinancials";
import { useProjects } from "@/hooks/useProjects";
import ReactDatePicker from "react-datepicker";

interface InvoiceFormProps {
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceInput>({
    defaultValues: {
      gross_amount: 0,
      vat_amount: 0,
      withholding_amount: 0,
      retention_amount: 0,
      advance_recovery_amount: 0,
      net_amount: 0,
      status: "pending"
    }
  });

  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const grossAmount = watch("gross_amount");
  const vatAmount = watch("vat_amount");
  const whAmount = watch("withholding_amount");
  const retAmount = watch("retention_amount");
  const advAmount = watch("advance_recovery_amount");

  // Auto-calculate logic
  React.useEffect(() => {
    if (grossAmount) {
      const vat = grossAmount * 0.15;
      const wh = grossAmount * 0.02;
      const ret = grossAmount * 0.10;

      setValue("vat_amount", Number(vat.toFixed(2)));
      setValue("withholding_amount", Number(wh.toFixed(2)));
      setValue("retention_amount", Number(ret.toFixed(2)));
    }
  }, [grossAmount, setValue]);

  React.useEffect(() => {
    const gross = Number(grossAmount) || 0;
    const vat = Number(vatAmount) || 0;
    const wh = Number(whAmount) || 0;
    const ret = Number(retAmount) || 0;
    const adv = Number(advAmount) || 0;

    const net = gross + vat - wh - ret - adv;
    setValue("net_amount", Number(net.toFixed(2)));
    setValue("amount", Number(net.toFixed(2))); // Sync with legacy amount field
  }, [grossAmount, vatAmount, whAmount, retAmount, advAmount, setValue]);

  const onSubmit = (data: CreateInvoiceInput) => {
    createInvoice(data, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to create invoice:", error),
    });
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
  ];

  const projectOptions = projects?.map((project) => ({
    value: project.id,
    label: project.title,
  })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-2xl p-8 space-y-6 max-w-2xl w-full">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Generate Interim Payment Certificate</h3>
        </div>
        <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-red-500 transition-colors">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Selection <span className="text-red-500">*</span></label>
          <Controller
            name="project_id"
            control={control}
            rules={{ required: "Project is required" }}
            render={({ field }) => (
              <Select
                {...field}
                options={projectOptions}
                isLoading={projectsLoading}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '2px'
                  })
                }}
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                value={projectOptions.find((option) => option.value === field.value)}
              />
            )}
          />
          {errors.project_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.project_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gross Amount (ETB) <span className="text-red-500">*</span></label>
          <input
            type="number"
            {...register("gross_amount", { required: "Gross amount is required", min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">VAT Amount (15%)</label>
          <input
            type="number"
            {...register("vat_amount")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono text-blue-600"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Withholding (2%)</label>
          <input
            type="number"
            {...register("withholding_amount")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono text-orange-600"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Retention (10%)</label>
          <input
            type="number"
            {...register("retention_amount")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono text-purple-600"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Advance Recovery</label>
          <input
            type="number"
            {...register("advance_recovery_amount", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Net IPC Amount</label>
          <input
            type="number"
            {...register("net_amount")}
            className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl focus:outline-none font-mono font-bold text-blue-700"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date <span className="text-red-500">*</span></label>
          <Controller
            name="due_date"
            control={control}
            rules={{ required: "Due date is required" }}
            render={({ field }) => (
              <ReactDatePicker
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                placeholderText="Select Date"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Initial Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={statusOptions}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '2px'
                  })
                }}
                onChange={(option) => field.onChange(option?.value)}
                value={statusOptions.find((o) => o.value === field.value)}
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description / Remarks</label>
        <textarea
          {...register("description")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="e.g. IPC #5 for phase 1 completion..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
        <button type="submit" disabled={isPending} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-blue-100">
          {isPending ? "Generating..." : "Generate IPC"}
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;
