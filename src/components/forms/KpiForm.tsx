"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateKpiInput } from "@/types/kpi";

interface KpiFormProps {
  userLaborId?: string;
  laborInfoId?: string;
  equipmentId?: string;

  onClose: () => void;
  onSubmit: (data: CreateKpiInput) => void;
  isPending?: boolean;
}

const KpiForm: React.FC<KpiFormProps> = ({
  userLaborId,
  laborInfoId,
  equipmentId,
  onClose,
  onSubmit,
  isPending = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateKpiInput>({
    defaultValues: {
      type: "Labor",
      score: 0,
      status: "Good",
      // Optional fields will be added on submit
    },
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  // Prepare data with optional field from props on submit
  const handleFormSubmit = (data: CreateKpiInput) => {
    if (userLaborId) data.userLaborId = userLaborId;
    else if (laborInfoId) data.laborInfoId = laborInfoId;
    else if (equipmentId) data.equipmentId = equipmentId;

    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create KPI</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <Controller
            name="type"
            control={control}
            rules={{ required: "Type is required" }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
              >
                <option value="Labor">Labor</option>
                <option value="Machinery">Machinery</option>
              </select>
            )}
          />
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("score", {
              required: "Score is required",
              min: { value: 0, message: "Score cannot be negative" },
            })}
            placeholder="Enter score"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.score && (
            <p className="text-red-500 text-sm mt-1">{errors.score.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
              >
                <option value="Bad">Bad</option>
                <option value="Good">Good</option>
                <option value="V.Good">V.Good</option>
                <option value="Excellent">Excellent</option>
              </select>
            )}
          />
          {errors.status && (
            <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
          )}
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remark
          </label>
          <textarea
            {...register("remark")}
            placeholder="Optional remarks"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            rows={3}
          />
        </div>

        {/* Target */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target
          </label>
          <input
            type="number"
            {...register("target", {
              min: { value: 0, message: "Target cannot be negative" },
            })}
            placeholder="Optional target"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.target && (
            <p className="text-red-500 text-sm mt-1">{errors.target.message}</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attach Files
        </label>

        <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:border-bs-primary transition-colors duration-300">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                     file:rounded-md file:border-0 
                     file:text-sm file:font-semibold 
                     file:bg-bs-primary file:text-white 
                     hover:file:bg-bs-primary/90"
          />
          <p className="mt-2 text-sm text-gray-500">
            You can select multiple files.
          </p>
        </div>

        {/* File list */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Files Selected:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
          disabled={isPending}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save KPI"}
        </button>
      </div>
    </form>
  );
};

export default KpiForm;
