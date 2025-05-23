"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useCreateSite } from "@/hooks/useSites";
import { CreateSiteInput } from "@/types/site";

interface SiteFormProps {
  onClose: () => void;
}

const SiteForm: React.FC<SiteFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSiteInput>();

  const { mutate: createSite, isPending } = useCreateSite(() => {
    onClose();
    window.location.reload();
  });

  const onSubmit = (data: CreateSiteInput) => {
    createSite(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4 w-96"
    >
      <div className="flex justify-between items-center pb-2 border-b">
        <h3 className="text-lg font-semibold">New Site</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-2xl text-red-500 hover:text-red-600"
        >
          &times;
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name", { required: "Site name is required" })}
          placeholder="Enter site name"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-600"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default SiteForm;
