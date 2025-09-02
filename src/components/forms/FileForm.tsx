"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateFile } from "@/hooks/useFiles";

interface FileFormProps {
  onClose: () => void;
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

const FileForm: React.FC<FileFormProps> = ({ onClose, type, referenceId }) => {
  const { register, handleSubmit, reset } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const createFile = useCreateFile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const onSubmit = handleSubmit((data) => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    createFile.mutate({
      title: data.title,
      sendTo: data.sendTo,
      type,
      referenceId,
      files: selectedFiles,
    });

    reset();
    setSelectedFiles([]);
    onClose();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-lg shadow-xl p-6 space-y-6 w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Upload File</h3>
        <button
          type="button"
          className="text-2xl text-red-500 hover:text-red-600"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Title
        </label>
        <input
          {...register("title", { required: true })}
          type="text"
          placeholder="Enter file title"
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        />
      </div>

      {/* Send To */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Send To
        </label>
        <select
          {...register("sendTo", { required: true })}
          className="w-full border rounded-md p-2 text-sm focus:ring-cyan-600 focus:border-cyan-600"
        >
          <option value="">Select User</option>
          <option value="user1">John Doe</option>
          <option value="user2">Jane Smith</option>
        </select>
      </div>

      {/* File Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Files
        </label>
        <div className="w-full border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50 hover:border-cyan-700 transition-colors duration-300">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                       file:rounded-md file:border-0 file:text-sm file:font-semibold 
                       file:bg-cyan-700 file:text-white hover:file:bg-cyan-800 cursor-pointer"
          />
          <p className="mt-2 text-sm text-gray-500">
            You can select multiple files.
          </p>
        </div>

        {/* File List */}
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
      <div className="flex justify-end gap-4 mt-4">
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
          Upload
        </button>
      </div>
    </form>
  );
};

export default FileForm;
