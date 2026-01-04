// PayrollForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { CreatePayrollInput } from "@/types/financial";
import { useCreatePayroll } from "@/hooks/useFinancials";
import { useUsers } from "@/hooks/useUsers";
import { useProjects } from "@/hooks/useProjects";

interface PayrollFormProps {
  onClose: () => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePayrollInput>({
    defaultValues: {
      basic_salary: 0,
      allowances: 0,
      gross_salary: 0,
      income_tax: 0,
      pension_employee: 0,
      pension_employer: 0,
      net_pay: 0,
      status: "pending"
    }
  });

  const { mutate: createPayroll, isPending } = useCreatePayroll();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const basicSalary = watch("basic_salary");
  const allowances = watch("allowances");
  const incomeTax = watch("income_tax");

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

    // Taxable income is Gross - Pension Employee (per Ethiopian law)
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
  }, [watch("gross_salary"), watch("income_tax"), watch("pension_employee"), setValue]);

  const onSubmit = (data: any) => {
    // Map internal form state to backend expected structure
    const payload: CreatePayrollInput = {
      ...data,
      project_id: data.project_id,
      user_id: data.user_id,
      amount: data.net_pay,
      pay_period: data.pay_period,
      status: data.status.toLowerCase(),
    };

    createPayroll(payload, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to create payroll:", error),
    });
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
  ];

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.role})`,
    })) || [];

  const projectOptions =
    projects?.map((p) => ({
      value: p.id,
      label: p.title,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-2xl p-8 space-y-6 max-w-2xl w-full"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Process Employee Payroll</h3>
        </div>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee Selection <span className="text-red-500">*</span></label>
          <Controller
            name="user_id"
            control={control}
            rules={{ required: "User is required" }}
            render={({ field }) => (
              <Select
                options={userOptions}
                isLoading={usersLoading}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '2px'
                  })
                }}
                onChange={(option) => field.onChange(option?.value)}
                value={userOptions.find((o) => o.value === field.value)}
              />
            )}
          />
          {errors.user_id && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.user_id.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Allocation <span className="text-red-500">*</span></label>
          <Controller
            name="project_id"
            control={control}
            rules={{ required: "Project is required" }}
            render={({ field }) => (
              <Select
                options={projectOptions}
                isLoading={projectsLoading}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '2px'
                  })
                }}
                onChange={(option) => field.onChange(option?.value)}
                value={projectOptions.find((o) => o.value === field.value)}
              />
            )}
          />
          {errors.project_id && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.project_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Basic Salary (ETB) <span className="text-red-500">*</span></label>
          <input
            type="number"
            {...register("basic_salary", { required: "Basic salary is required", min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Allowances (Taxable)</label>
          <input
            type="number"
            {...register("allowances", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gross Salary</label>
          <input
            type="number"
            {...register("gross_salary")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-mono font-bold"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Income Tax (PAYE)</label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Net Pay Check</label>
          <input
            type="number"
            {...register("net_pay")}
            className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl focus:outline-none font-mono font-bold text-emerald-700 text-lg"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pay Period <span className="text-red-500">*</span></label>
          <input
            type="text"
            {...register("pay_period", { required: "Period is required" })}
            placeholder="e.g. 2024-01"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
          />
          {errors.pay_period && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.pay_period.message}</p>
          )}
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
          disabled={isPending}
          className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-emerald-100"
        >
          {isPending ? "Processing..." : "Finish Monthly Payroll"}
        </button>
      </div>
    </form>
  );
};

export default PayrollForm;
