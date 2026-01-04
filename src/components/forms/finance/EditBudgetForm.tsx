// EditBudgetForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { UpdateBudgetInput } from "@/types/financial";
import { useProjects } from "@/hooks/useProjects";

interface EditBudgetFormProps {
  onSubmit: (data: UpdateBudgetInput) => void;
  onClose: () => void;
  budget: UpdateBudgetInput;
}

const EditBudgetForm: React.FC<EditBudgetFormProps> = ({
  onSubmit,
  onClose,
  budget,
}) => {
  const {
    register,
    handleSubmit,
    control,
  } = useForm<UpdateBudgetInput>({ defaultValues: budget });

  const { data: projects } = useProjects();

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
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Edit Budget Allocation</h3>
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
            Project
          </label>
          <Controller
            name="project_id"
            control={control}
            render={({ field }) => (
              <Select
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Allocated Amount (ETB)</label>
          <input
            type="number"
            {...register("allocated_amount", { min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Spent Amount</label>
          <input
            type="number"
            {...register("spent_amount", { min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remaining Amount</label>
          <input
            type="number"
            {...register("remaining_amount", { min: 0, valueAsNumber: true })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
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

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
        <textarea
          {...register("description")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
          className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-100"
        >
          Update Budget
        </button>
      </div>
    </form>
  );
};

export default EditBudgetForm;
