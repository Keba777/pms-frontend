"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { CreateTodoProgressInput } from "@/types/todo";
import { useCreateTodoProgress } from "@/hooks/useTodos";

interface CreateTodoProgressFormProps {
  todoId: string;
  onClose: () => void;
}

const CreateTodoProgressForm: React.FC<CreateTodoProgressFormProps> = ({
  todoId,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTodoProgressInput>({
    defaultValues: {
      todoId,
      progress: 0,
      remark: "",
    },
  });

  const { mutate: createTodoProgress, isPending } = useCreateTodoProgress();

  const onSubmit = (data: CreateTodoProgressInput) => {
    const attachment =
      data.attachment instanceof FileList ? Array.from(data.attachment) : [];

    createTodoProgress(
      { ...data, attachment },
      {
        onSuccess: () => {
          reset({ todoId, progress: 0, remark: "", attachment: [] });
          onClose();
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6"
    >
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Add Todo Progress
        </h3>
        <button
          type="button"
          className="text-3xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Progress Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("progress", {
            required: "Progress is required",
            min: { value: 0, message: "Progress cannot be less than 0" },
            max: { value: 100, message: "Progress cannot exceed 100" },
          })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
          placeholder="Enter progress percentage"
        />
        {errors.progress && (
          <p className="text-red-500 text-sm mt-1">{errors.progress.message}</p>
        )}
      </div>

      {/* Remark Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Remark
        </label>
        <textarea
          {...register("remark")}
          rows={3}
          placeholder="Optional remark..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-bs-primary"
        />
      </div>

      {/* Hidden TodoId */}
      <input type="hidden" {...register("todoId")} value={todoId} />

      {/* Attachments Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <input
          type="file"
          multiple
          {...register("attachment")}
          className="w-full text-sm text-gray-700"
        />
      </div>

      {/* Footer Buttons */}
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
          disabled={isPending}
          className="px-4 py-2 bg-bs-primary text-white rounded-md hover:bg-bs-primary"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default CreateTodoProgressForm;
