// BudgetForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { CreateBudgetInput } from "@/types/financial";
import { useCreateBudget } from "@/hooks/useFinancials";
import { useProjects } from "@/hooks/useProjects";

interface BudgetFormProps {
  onClose: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateBudgetInput>();

  const { mutate: createBudget, isPending } = useCreateBudget();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const onSubmit = (data: CreateBudgetInput) => {
    createBudget(data, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to create budget:", error),
    });
  };

  const statusOptions = [
    { value: "planned", label: "Planned" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
  ];

  const projectOptions =
    projects?.map((project) => ({
      value: project.id,
      label: project.title,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-2xl p-8 space-y-6 max-w-2xl w-full"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Create New Budget</h3>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Project <span className="text-red-500">*</span>
          </label>
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Allocated Amount (ETB) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("allocated_amount", { required: "Allocated amount is required", min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Current Spent <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("spent_amount", { required: "Spent amount is required", min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Remaining Amount
          </label>
          <input
            type="number"
            {...register("remaining_amount", { min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Current Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={statusOptions}
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
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea
          {...register("description")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          placeholder="Detailed breakdown or notes about this budget..."
          rows={3}
        />
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
          className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-indigo-100"
        >
          {isPending ? "Setting..." : "Set Budget"}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
