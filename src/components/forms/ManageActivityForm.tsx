// ManageActivityForm.tsx
"use client";

import { UpdateActivityInput } from "@/types/activity";
import React from "react";
import { useForm, Controller } from "react-hook-form";

const ManageActivityForm: React.FC<{
  onSubmit: (data: UpdateActivityInput) => void;
  onClose: () => void;
  activity: UpdateActivityInput;
}> = ({ onSubmit, onClose, activity }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateActivityInput>({
    defaultValues: activity,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Manage Progress</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Progress (%):
        </label>
        <Controller
          name="progress"
          control={control}
          render={({ field }) => (
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="range"
                min={0}
                max={100}
                {...field}
                className="flex-1"
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
              <span className="w-12 text-right">{field.value}%</span>
            </div>
          )}
        />
      </div>
      {errors.progress && (
        <p className="text-red-500 text-sm ml-32">{errors.progress.message}</p>
      )}

      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
        >
          Update Progress
        </button>
      </div>
    </form>
  );
};

export default ManageActivityForm;
