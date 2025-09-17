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
        <h3 className="text-xl font-semibold text-gray-800">Create Budget</h3>
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
          Total <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("total", { required: "Total is required", min: 0 })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.total && (
          <p className="text-red-500 text-sm mt-1">{errors.total.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allocated <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("allocated", {
            required: "Allocated is required",
            min: 0,
          })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.allocated && (
          <p className="text-red-500 text-sm mt-1">
            {errors.allocated.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spent <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("spent", { required: "Spent is required", min: 0 })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.spent && (
          <p className="text-red-500 text-sm mt-1">{errors.spent.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Remaining <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("remaining", {
            required: "Remaining is required",
            min: 0,
          })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.remaining && (
          <p className="text-red-500 text-sm mt-1">
            {errors.remaining.message}
          </p>
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

export default BudgetForm;
