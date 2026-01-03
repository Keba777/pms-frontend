"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UpdateTaskInput, Task } from "@/types/task";
import { User } from "@/types/user";

interface EditTaskFormProps {
  onSubmit: (data: UpdateTaskInput | FormData) => void;
  onClose: () => void;
  task: Task | (UpdateTaskInput & { id: string });
  users?: User[];
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({
  onSubmit,
  onClose,
  task,
  users,
}) => {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [keptAttachments, setKeptAttachments] = React.useState<string[]>(
    (task as any).existingAttachments ||
    (Array.isArray(task.attachments) && typeof task.attachments[0] === 'string'
      ? (task.attachments as string[])
      : [])
  );

  // Transform task data to match UpdateTaskInput structure
  const { attachments, ...taskWithoutAttachments } = task;

  let initialAssignedUsers: string[] = [];
  if (task.assignedUsers) {
    if (task.assignedUsers.length > 0 && typeof task.assignedUsers[0] === 'string') {
      initialAssignedUsers = task.assignedUsers as any as string[];
    } else {
      initialAssignedUsers = (task.assignedUsers as any[]).map(user => user.id);
    }
  }

  const defaultValues: UpdateTaskInput = {
    ...taskWithoutAttachments,
    assignedUsers: initialAssignedUsers
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateTaskInput>({
    defaultValues,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      event.target.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setKeptAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data: UpdateTaskInput) => {
    // Ensure ID is present
    const submitData = { ...data, id: task.id };

    // Ensure unique assignedUsers
    if (submitData.assignedUsers) {
      submitData.assignedUsers = Array.from(new Set(submitData.assignedUsers));
    }

    let finalData: UpdateTaskInput | FormData = submitData;

    if (selectedFiles.length > 0 || keptAttachments.length !== (task.attachments?.length || 0)) {
      const formData = new FormData();
      formData.append("id", task.id);

      // Append all fields
      Object.entries(submitData).forEach(([key, value]) => {
        if (key === "attachments" || key === "existingAttachments") return;

        if (Array.isArray(value)) {
          value.forEach((val) => formData.append(key, val as string));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      selectedFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      keptAttachments.forEach((url) => {
        formData.append("existingAttachments", url);
      });

      finalData = formData;
    } else if (keptAttachments.length !== (task.attachments?.length || 0)) {
      // If no new files but existing attachments removed, send updated list
      finalData = { ...submitData, existingAttachments: keptAttachments };
    }

    onSubmit(finalData);
  };

  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "Started", label: "Started" },
    { value: "InProgress", label: "In Progress" },
    { value: "Canceled", label: "Canceled" },
    { value: "Onhold", label: "Onhold" },
    { value: "Completed", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "Critical", label: "Critical" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];

  const approvalOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Not Approved", label: "Not Approved" },
    { value: "Pending", label: "Pending" },
  ];

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.role?.name})`,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-4"
    >
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Task</h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Task Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("task_name", { required: "Task Name is required" })}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.task_name && (
        <p className="text-red-500 text-sm ml-32">{errors.task_name.message}</p>
      )}

      {/* ... Keeping existing fields ... */}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Status<span className="text-red-500">*</span>
        </label>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={statusOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={statusOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>
      {errors.status && (
        <p className="text-red-500 text-sm ml-32">{errors.status.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Priority
        </label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={priorityOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={priorityOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Approval
        </label>
        <Controller
          name="approvalStatus"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={approvalOptions}
              className="flex-1"
              onChange={(selectedOption) =>
                field.onChange(selectedOption?.value)
              }
              value={approvalOptions.find(
                (option) => option.value === field.value
              )}
            />
          )}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Start Date<span className="text-red-500">*</span>
        </label>
        <Controller
          name="start_date"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <>
              <ReactDatePicker
                showFullMonthYearPicker
                showYearDropdown
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any, event?: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                placeholderText="Enter Start Date"
              />
            </>
          )}
        />
      </div>
      {errors.start_date && (
        <p className="text-red-500 text-sm ml-32">
          {errors.start_date.message}
        </p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          End Date<span className="text-red-500">*</span>
        </label>
        <Controller
          name="end_date"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <>
              <ReactDatePicker
                showFullMonthYearPicker
                showYearDropdown
                selected={field.value ? new Date(field.value) : undefined}
                onChange={(date: any, event?: any) => {
                  const d = Array.isArray(date) ? date[0] : date;
                  field.onChange(d ? d.toISOString() : undefined);
                }}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
                placeholderText="Enter End Date"
              />
            </>
          )}
        />
      </div>
      {errors.end_date && (
        <p className="text-red-500 text-sm ml-32">{errors.end_date.message}</p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Progress (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          {...register("progress")}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      <div className="flex items-start space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Description<span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("description", { required: "Description is required" })}
          rows={3}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>
      {errors.description && (
        <p className="text-red-500 text-sm ml-32">
          {errors.description.message}
        </p>
      )}

      <div className="flex items-center space-x-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Assigned Users
        </label>
        <Controller
          name="assignedUsers"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={userOptions}
              isMulti
              className="flex-1"
              onChange={(selectedOptions) =>
                field.onChange(selectedOptions.map((option) => option.value))
              }
              value={userOptions.filter((option) =>
                field.value?.includes(option.value)
              )}
            />
          )}
        />
      </div>

      {/* Attachments Section */}
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

        {/* Selected New Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              New Files Selected:
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center bg-gray-100 p-1 rounded">
                  <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2 font-bold"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Existing Attachments */}
        {keptAttachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Existing Attachments:
            </h4>
            <ul className="space-y-2">
              {keptAttachments.map((url, index) => {
                const fileName = url.split("/").pop() || `Attachment ${index + 1}`;
                return (
                  <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-xs">
                      {fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeExistingAttachment(index)}
                      className="text-red-500 hover:text-red-700 ml-2 font-bold"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
          onClick={onClose}
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

export default EditTaskForm;
