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
        <h3 className="text-lg font-semibold text-gray-800">Edit Budget</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-red-500 hover:text-red-600"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Project
        </label>
        <Controller
          name="projectId"
          control={control}
          render={({ field }) => (
            <Select
              options={projectOptions}
              className="flex-1"
              onChange={(option) => field.onChange(option?.value)}
              value={projectOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Total</label>
        <input
          type="number"
          {...register("total", { min: 0 })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Allocated
        </label>
        <input
          type="number"
          {...register("allocated", { min: 0 })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Spent</label>
        <input
          type="number"
          {...register("spent", { min: 0 })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Remaining
        </label>
        <input
          type="number"
          {...register("remaining", { min: 0 })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
        >
          Update
        </button>
      </div>
    </form>
  );
};

export default EditBudgetForm;
