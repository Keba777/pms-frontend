// EditPayrollForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { UpdatePayrollInput } from "@/types/financial";
import { useUsers } from "@/hooks/useUsers";

interface EditPayrollFormProps {
  onSubmit: (data: UpdatePayrollInput) => void;
  onClose: () => void;
  payroll: UpdatePayrollInput;
}

const EditPayrollForm: React.FC<EditPayrollFormProps> = ({
  onSubmit,
  onClose,
  payroll,
}) => {
  const { register, handleSubmit, control } = useForm<UpdatePayrollInput>({
    defaultValues: payroll,
  });

  const { data: users } = useUsers();

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Paid", label: "Paid" },
  ];

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Payroll</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-red-500 hover:text-red-600"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">User</label>
        <Controller
          name="userId"
          control={control}
          render={({ field }) => (
            <Select
              options={userOptions}
              className="flex-1"
              onChange={(option) => field.onChange(option?.value)}
              value={userOptions.find((o) => o.value === field.value)}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Salary</label>
        <input
          type="number"
          {...register("salary", { min: 0 })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Month</label>
        <input
          type="text"
          {...register("month")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={statusOptions}
              className="flex-1"
              onChange={(option) => field.onChange(option?.value)}
              value={statusOptions.find((o) => o.value === field.value)}
            />
          )}
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

export default EditPayrollForm;
