// PayrollForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { CreatePayrollInput } from "@/types/financial";
import { useCreatePayroll } from "@/hooks/useFinancials";
import { useUsers } from "@/hooks/useUsers";

interface PayrollFormProps {
  onClose: () => void;
}

const PayrollForm: React.FC<PayrollFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePayrollInput>();

  const { mutate: createPayroll, isPending } = useCreatePayroll();
  const { data: users, isLoading: usersLoading } = useUsers();

  const onSubmit = (data: CreatePayrollInput) => {
    createPayroll(data, {
      onSuccess: () => onClose(),
      onError: (error) => console.error("Failed to create payroll:", error),
    });
  };

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
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Create Payroll</h3>
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
          User <span className="text-red-500">*</span>
        </label>
        <Controller
          name="userId"
          control={control}
          rules={{ required: "User is required" }}
          render={({ field }) => (
            <Select
              options={userOptions}
              isLoading={usersLoading}
              onChange={(option) => field.onChange(option?.value)}
              value={userOptions.find((o) => o.value === field.value)}
            />
          )}
        />
        {errors.userId && (
          <p className="text-red-500 text-sm mt-1">{errors.userId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Salary <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("salary", { required: "Salary is required", min: 0 })}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.salary && (
          <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Month <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("month", { required: "Month is required" })}
          placeholder="YYYY-MM"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
        />
        {errors.month && (
          <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={statusOptions}
              onChange={(option) => field.onChange(option?.value)}
              value={statusOptions.find((o) => o.value === field.value)}
            />
          )}
        />
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

export default PayrollForm;
