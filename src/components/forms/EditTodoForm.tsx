"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateTodoInput } from "@/types/todo";
import { User } from "@/types/user";
import Select from "react-select";
import ReactDatePicker from "react-datepicker";

interface EditTodoFormProps {
  onSubmit: (data: UpdateTodoInput) => void;
  onClose: () => void;
  todo: UpdateTodoInput;
  users?: User[];
}

const EditTodoForm: React.FC<EditTodoFormProps> = ({
  onSubmit,
  onClose,
  todo,
  users,
}) => {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateTodoInput>({
    defaultValues: todo,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    (todo as any).attachment || []
  );
  const [targetList, setTargetList] = useState<string[]>(todo.target || []);
  const [targetInput, setTargetInput] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (urlToRemove: string) => {
    setExistingAttachments((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const addTargetItem = () => {
    if (targetInput.trim()) {
      setTargetList([...targetList, targetInput.trim()]);
      setTargetInput("");
    }
  };

  const removeTargetItem = (index: number) => {
    setTargetList(targetList.filter((_, i) => i !== index));
  };

  const cleanData = (data: UpdateTodoInput) => {
    const newData = { ...data };
    newData.target = targetList;
    newData.existingAttachments = existingAttachments;
    newData.attachment = selectedFiles;
    return newData;
  };

  const statusOptions = [
    {
      value: "Not Started",
      label: "Not Started",
      className: "bg-bs-dark-100 text-bs-dark",
    },
    {
      value: "In progress",
      label: "In Progress",
      className: "bg-bs-secondary-100 text-bs-secondary",
    },
    {
      value: "Pending",
      label: "Pending",
      className: "bg-bs-warning-100 text-bs-warning",
    },
    {
      value: "Completed",
      label: "Completed",
      className: "bg-bs-success-100 text-bs-success",
    },
  ];

  const priorityOptions = [
    {
      value: "Urgent",
      label: "Urgent",
      className: "bg-bs-danger-100 text-bs-danger",
    },
    { value: "High", label: "High", className: "bg-bs-info-100 text-bs-info" },
    {
      value: "Medium",
      label: "Medium",
      className: "bg-bs-dark-100 text-bs-dark",
    },
    {
      value: "Low",
      label: "Low",
      className: "bg-bs-warning-100 text-bs-warning",
    },
  ];

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.role?.name})`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(cleanData(data)))}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Edit Todo</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("task", { required: "Task Name is required" })}
            placeholder="Enter Task Name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.task && (
            <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("type", { required: "Type is required" })}
            placeholder="Enter Todo Type"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: "Priority is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={priorityOptions}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={priorityOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={statusOptions}
                  className="w-full"
                  onChange={(selectedOption) =>
                    field.onChange(selectedOption?.value)
                  }
                  value={statusOptions.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Progress (%)
          </label>
          <input
            type="number"
            {...register("progress", {
              min: 0,
              max: 100,
            })}
            placeholder="Enter progress (0-100)"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
          />
          {errors.progress && (
            <p className="text-red-500 text-sm mt-1">
              Progress must be between 0 and 100
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date
            </label>
            <Controller
              name="target_date"
              control={control}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Target Date"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="dueDate"
              control={control}
              rules={{ required: "Due date is required" }}
              render={({ field }) => (
                <>
                  <ReactDatePicker
                    showFullMonthYearPicker
                    showYearDropdown
                    selected={field.value ? new Date(field.value) : undefined}
                    onChange={(date: any) => {
                      const d = Array.isArray(date) ? date[0] : date;
                      field.onChange(d ? d.toISOString() : undefined);
                    }}
                    placeholderText="Enter Due Date"
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                  />
                </>
              )}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Target List UI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target List
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Add target item"
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTargetItem();
                }
              }}
            />
            <button
              type="button"
              onClick={addTargetItem}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
          {targetList.length > 0 && (
            <ul className="list-disc list-inside space-y-1 bg-gray-50 p-2 rounded border">
              {targetList.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeTargetItem(idx)}
                    className="text-red-500 hover:text-red-700 font-bold px-2"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned to
          </label>
          <Controller
            name="assignedUsers"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={userOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={(selectedOptions) =>
                  field.onChange(selectedOptions.map((option) => option.value))
                }
                value={userOptions.filter(
                  (option: { value: string; label: string }) =>
                    field.value?.includes(option.value)
                )}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remark
          </label>
          <textarea
            {...register("remark")}
            placeholder="Enter Remark"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
            rows={3}
          />
        </div>

        {/* Attachments Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Attachments
          </label>
          {existingAttachments.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2 mb-4">
              {existingAttachments.map((url, idx) => (
                <li key={idx} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                  <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs" title={url}>
                    {url.split("/").pop()}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeExistingAttachment(url)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic mb-4">No existing attachments</p>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add New Files
          </label>
          <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:border-cyan-700 transition-colors duration-300">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-700 file:text-white hover:file:bg-cyan-800"
            />
            <p className="mt-2 text-sm text-gray-500">
              Select new files to add.
            </p>
          </div>
          {selectedFiles.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">New Files Selected:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium ml-2"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
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
          >
            Update
          </button>
        </div>
      </div>
    </form >
  );
};

export default EditTodoForm;
