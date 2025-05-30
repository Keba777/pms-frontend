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

  const getProgressColor = (value: number) => {
    if (value <= 25) return "#EF4444"; // red-500
    if (value <= 50) return "#F97316"; // orange-500
    if (value <= 75) return "#EAB308"; // yellow-500
    return "#22C55E"; // green-500
  };

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
          ×
        </button>
      </div>

      <div className="flex items-center space-x-4 my-10">
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
                {/* Progress Bar with Percentage Display */}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                  {/* Current Progress Percentage Above Bar */}
                  <span
                    className="absolute text-sm font-bold text-black"
                    style={{
                      left: `${field.value}%`,
                      transform: "translateX(-50%)",
                      top: "-1.5rem",
                    }}
                  >
                    {field.value}%
                  </span>
                </div>

                {/* Percentage Markers Below Bar */}
                <div className="relative flex justify-between -mt-2">
                  {[0, 25, 50, 75, 100].map((mark) => (
                    <span
                      key={mark}
                      className="text-xs text-gray-800"
                      style={{
                        position: "absolute",
                        left: `${mark}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {mark}
                    </span>
                  ))}
                </div>

                {/* 0% and 100% Labels Above Bar Ends */}
                <div className="flex justify-between text-sm font-bold text-gray-800 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          }}
        />
      </div>
      {errors.progress && (
        <p className="text-red-500 text-sm ml-32">{errors.progress.message}</p>
      )}

      <div>
        <label htmlFor="checkedBy" className="mr-2">
          Checked by:-
        </label>
        <input
          type="text"
          id="checkedBy"
          className="ml-4 px-3 border focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
        <input
          type="date"
          id="checkedDate"
          className="ml-4 px-3 border focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <table className="min-w-max divide-y divide-gray-200">
        <thead className="bg-cyan-700">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              #
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Date & Time
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Progress%
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Remark
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Checked By
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Action
            </th>
          </tr>
        </thead>
      </table>

      <h1 className="underline font-semibold">Summary Report</h1>
      <textarea className="w-full border p-2 focus:outline-none focus:ring-2 focus:ring-bs-primary" />

      <p>Checked BY</p>
      <p>Approved By</p>
      <p>Comment</p>
      <p>Approved Date</p>

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