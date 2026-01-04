"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateInvoiceInput } from "@/types/financial";
import { useProjects } from "@/hooks/useProjects";
import ReactDatePicker from "react-datepicker";

interface EditInvoiceFormProps {
  onSubmit: (data: UpdateInvoiceInput) => void;
  onClose: () => void;
  invoice: UpdateInvoiceInput;
}

const EditInvoiceForm: React.FC<EditInvoiceFormProps> = ({ onSubmit, onClose, invoice }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateInvoiceInput>({ defaultValues: invoice });

  const { data: projects } = useProjects();

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
    setValue("amount", Number(net.toFixed(2)));
  }, [grossAmount, vatAmount, whAmount, retAmount, advAmount, setValue]);

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
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Edit IPC Details</h3>
        <button type="button" onClick={onClose} className="text-3xl text-gray-400 hover:text-red-500 transition-colors">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project</label>
          <Controller
            name="project_id"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={projectOptions}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                  })
                }}
                onChange={(option) => field.onChange(option?.value)}
                value={projectOptions.find((o) => o.value === field.value)}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gross Amount (ETB)</label>
          <input
            type="number"
            {...register("gross_amount", { min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
          <Controller
            name="due_date"
            control={control}
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
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
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
        <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-100">Update IPC</button>
      </div>
    </form>
  );
};

export default EditInvoiceForm;