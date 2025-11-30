"use client";

import React, { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { CreateApprovalInput } from "@/types/approval";
import { useCreateApproval, useApprovalHistory } from "@/hooks/useApprovals";
import { useDepartments } from "@/hooks/useDepartments";
import { useAuthStore } from "@/store/authStore";
import { useUsers } from "@/hooks/useUsers";
import Select from "react-select";
import { useSettingsStore } from "@/store/settingsStore";
import { normalizeDatePickerValue } from "@/utils/datePicker";
import EtDatePicker from "habesha-datepicker"; 
import ReactDatePicker from "react-datepicker";

interface ApprovalFormProps {
  requestId: string;
  departmentId: string;
  onClose: () => void;
}

const ApprovalForm: React.FC<ApprovalFormProps> = ({
  requestId,
  departmentId,
  onClose,
}) => {
  const { useEthiopianDate } = useSettingsStore();
  const user = useAuthStore((state) => state.user);
  const now = new Date();

  const { register, handleSubmit, control, setValue } =
    useForm<CreateApprovalInput>({
      defaultValues: {
        requestId,
        departmentId,
        stepOrder: 1,
        status: "Pending",
        approvedBy: user?.id,
        approvedAt: now,
        checkedBy: user?.id,
        finalDepartment: false,
      },
    });

  const { data: historyData } = useApprovalHistory(requestId);
  const { data: depts, isLoading: deptsLoading } = useDepartments();
  const { data: users = [] } = useUsers();
  const { mutate, isPending: isSubmitting } = useCreateApproval();

  useEffect(() => {
    const history = historyData || [];
    if (history.length) {
      const last = history[history.length - 1];
      setValue("stepOrder", last.stepOrder + 1);
      setValue("prevDepartmentId", last.departmentId);
    }
  }, [historyData, setValue]);

  const onSubmit = (data: CreateApprovalInput) => {
    mutate(data, { onSuccess: onClose });
  };

  const finalDept = useWatch({ control, name: "finalDepartment" });

  const deptOptions = depts?.map((d) => ({ value: d.id, label: d.name })) || [];
  const userOptions = users.map((u) => ({
    value: u.id,
    label: u.first_name,
  }));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Allocate Approval
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-3xl text-red-500 hover:text-red-600"
        >
          &times;
        </button>
      </div>

      <input type="hidden" {...register("requestId")} />
      <input type="hidden" {...register("departmentId")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Step Order
          </label>
          <input
            type="number"
            {...register("stepOrder")}
            readOnly
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Approved", label: "Approved" },
                  { value: "Rejected", label: "Rejected" },
                ]}
                onChange={(opt) => field.onChange(opt?.value)}
                value={
                  [
                    { value: "Pending", label: "Pending" },
                    { value: "Approved", label: "Approved" },
                    { value: "Rejected", label: "Rejected" },
                  ].find((o) => o.value === field.value) || null
                }
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approved By
          </label>
          <Controller
            name="approvedBy"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={userOptions}
                isDisabled
                value={userOptions.find((o) => o.value === field.value) || null}
                onChange={(opt) => field.onChange(opt?.value)}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approved At
          </label>
          <Controller
            name="approvedAt"
            control={control}
            render={({ field }) => (
              <>
                {useEthiopianDate ? (
                  <EtDatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    isRange={false}
                  />
                ) : (
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any, event?: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Approved At"
                    className="w-full px-3 py-2 border rounded-md"
                    dateFormat="Pp"
                  />
                )}
              </>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Checked By
          </label>
          <Controller
            name="checkedBy"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={userOptions}
                onChange={(opt) => field.onChange(opt?.value)}
                value={userOptions.find((o) => o.value === field.value) || null}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks
          </label>
          <textarea
            {...register("remarks")}
            rows={2}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Previous Department
          </label>
          <Controller
            name="prevDepartmentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={deptOptions}
                isDisabled
                value={deptOptions.find((o) => o.value === field.value)}
                isLoading={deptsLoading}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Next Department
          </label>
          <Controller
            name="nextDepartmentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={deptOptions}
                isDisabled={finalDept}
                onChange={(opt) => field.onChange(opt?.value)}
                value={deptOptions.find((o) => o.value === field.value) || null}
              />
            )}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("finalDepartment")}
          id="finalDepartment"
          className="mr-2"
        />
        <label htmlFor="finalDepartment" className="text-sm text-gray-700">
          This is the final department
        </label>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Approval"}
        </button>
      </div>
    </form>
  );
};

export default ApprovalForm;