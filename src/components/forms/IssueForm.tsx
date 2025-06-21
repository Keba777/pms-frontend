// components/forms/IssueForm.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { CreateIssueInput } from "@/types/issue";
import { useCreateIssue } from "@/hooks/useIssues";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";

interface IssueFormProps {
  raisedById: string;
  siteId?: string;
  activityId?: string;
  projectId?: string;
  taskId?: string;
  onClose: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({
  raisedById,
  siteId,
  activityId,
  projectId,
  taskId,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateIssueInput>();

  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const { mutate: createIssue, isPending } = useCreateIssue();

  const onSubmit = (data: CreateIssueInput) => {
    createIssue(
      {
        ...data,
        date: new Date(),
        raisedById,
        siteId,
        activityId,
        projectId,
        taskId,
      },
      {
        onSuccess: () => {
          onClose();
          window.location.reload();
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Create Issue</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        {/* Issue Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("issueType", { required: "Type is required" })}
            placeholder="Enter Issue Type"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.issueType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.issueType.message}
            </p>
          )}
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <Controller
              name="priority"
              control={control}
              defaultValue="Medium"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              defaultValue="Open"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              )}
            />
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Describe the issue"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            rows={3}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Department & Responsible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible
            </label>
            <Controller
              name="responsibleId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>

        {/* Action Taken */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Taken
          </label>
          <textarea
            {...register("actionTaken")}
            placeholder="What was done?"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
            rows={2}
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-700 text-white rounded-md hover:bg-cyan-800"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Issue"}
        </button>
      </div>
    </form>
  );
};

export default IssueForm;
