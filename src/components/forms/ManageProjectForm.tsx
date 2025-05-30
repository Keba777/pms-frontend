"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { UpdateProjectInput } from "@/types/project";

const ManageProjectForm: React.FC<{
  onSubmit: (data: UpdateProjectInput) => void;
  onClose: () => void;
  project: UpdateProjectInput;
}> = ({ onSubmit, onClose, project }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProjectInput>({
    defaultValues: project,
  });

  const getProgressColor = (value: number) => {
    if (value <= 25) return "#EF4444"; // red-500
    if (value <= 50) return "#F97316"; // orange-500
    if (value <= 75) return "#EAB308"; // yellow-500
    return "#22C55E"; // green-500
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Manage Progress</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Progress (%):
        </label>
        <Controller
          name="progress"
          control={control}
          render={({ field }) => {
            const color = getProgressColor(field.value ?? 0);
            return (
              <div className="flex-1 flex flex-col space-y-2">
                {/* Progress Bar */}
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    {...field}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${color} ${
                        field.value ?? 0
                      }%, #E5E7EB ${field.value ?? 0}%)`,
                    }}
                    onChange={(e) => field.onChange(+e.target.value)}
                  />
                  <span
                    className="absolute text-sm font-bold text-gray-800"
                    style={{
                      left: `${field.value}%`,
                      transform: "translateX(-50%)",
                      top: "-1.5rem",
                    }}
                  >
                    {field.value}%
                  </span>
                </div>
                {/* Markers */}
                <div className="relative flex justify-between -mt-2 text-xs text-gray-600">
                  {[0, 25, 50, 75, 100].map((mark) => (
                    <span
                      key={mark}
                      style={{
                        position: "absolute",
                        left: `${mark}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {mark}%
                    </span>
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>

      {errors.progress && (
        <p className="text-red-500 text-sm ml-32">{errors.progress.message}</p>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Update Progress
        </button>
      </div>
    </form>
  );
};

export default ManageProjectForm;
