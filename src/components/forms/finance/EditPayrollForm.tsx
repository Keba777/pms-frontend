// EditPayrollForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { UpdatePayrollInput } from "@/types/financial";
import { useUsers } from "@/hooks/useUsers";

interface EditPayrollFormProps {
  onSubmit: (data: UpdatePayrollInput) => void;
  onClose: () => void;
  payroll: UpdatePayrollInput;
}

const EditPayrollForm: React.FC<EditPayrollFormProps> = ({
  onSubmit,
  onClose,
  payroll,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdatePayrollInput>({ defaultValues: payroll });

  const { data: users } = useUsers();

  const basicSalary = watch("basic_salary");
  const allowances = watch("allowances");

  // Ethiopian Income Tax Calculation Logic
  const calculatePIT = (taxableIncome: number) => {
    if (taxableIncome <= 600) return 0;
    if (taxableIncome <= 1650) return taxableIncome * 0.1 - 60;
    if (taxableIncome <= 3200) return taxableIncome * 0.15 - 142.5;
    if (taxableIncome <= 5250) return taxableIncome * 0.2 - 302.5;
    if (taxableIncome <= 7800) return taxableIncome * 0.25 - 565;
    if (taxableIncome <= 10900) return taxableIncome * 0.3 - 955;
    return taxableIncome * 0.35 - 1500;
  };

  React.useEffect(() => {
    const basic = Number(basicSalary) || 0;
    const allow = Number(allowances) || 0;
    const gross = basic + allow;

    const penEmp = basic * 0.07;
    const penComp = basic * 0.11;

    const taxableIncome = gross - penEmp;
    const tax = calculatePIT(taxableIncome);

    setValue("gross_salary", Number(gross.toFixed(2)));
    setValue("pension_employee", Number(penEmp.toFixed(2)));
    setValue("pension_employer", Number(penComp.toFixed(2)));
    setValue("income_tax", Number(tax.toFixed(2)));
  }, [basicSalary, allowances, setValue]);

  React.useEffect(() => {
    const gross = Number(watch("gross_salary")) || 0;
    const tax = Number(watch("income_tax")) || 0;
    const penEmp = Number(watch("pension_employee")) || 0;

    const net = gross - tax - penEmp;
    setValue("net_pay", Number(net.toFixed(2)));
    setValue("amount", Number(net.toFixed(2)));
  }, [watch("gross_salary"), watch("income_tax"), watch("pension_employee"), setValue]);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
  ];

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-2xl p-8 space-y-6 max-w-2xl w-full"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Edit Payroll Entry</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-gray-400 hover:text-red-500 transition-colors"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee</label>
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <Select
                options={userOptions}
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                  })
                }}
                onChange={(option) => field.onChange(option?.value)}
                value={userOptions.find((o) => o.value === field.value)}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Basic Salary (ETB)</label>
          <input
            type="number"
            {...register("basic_salary", { min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Allowances</label>
          <input
            type="number"
            {...register("allowances", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gross Salary</label>
          <input
            type="number"
            {...register("gross_salary")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Income Tax</label>
          <input
            type="number"
            {...register("income_tax")}
            className="w-full px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl focus:outline-none font-mono text-rose-600"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pension (7%)</label>
          <input
            type="number"
            {...register("pension_employee")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Net Pay</label>
          <input
            type="number"
            {...register("net_pay")}
            className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none font-mono font-bold text-emerald-700"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pay Period</label>
          <input
            type="text"
            {...register("pay_period")}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
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

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-100"
        >
          Update Record
        </button>
      </div>
    </form>
  );
};

export default EditPayrollForm;
