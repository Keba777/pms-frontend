"use client";

import React, { useState, useRef } from "react";
import {
  ChevronDown,
  Eye,
  Download,
  Edit,
  Trash2,
  PlusIcon,
} from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { toast } from "react-toastify";
import FileForm from "../forms/FileForm";
import { AppFile } from "@/types/file";

interface FileTableProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export default function FileTable({ type, referenceId }: FileTableProps) {
  const { data: files, isLoading, error } = useFiles();
  const [showForm, setShowForm] = useState(false);
  const [dropdownFileId, setDropdownFileId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (isLoading) return <div>Loading files...</div>;
  if (error) return <div>Error loading files</div>;

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString();
    } catch {
      return String(date);
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handleEdit = (fileId: string) => {
    toast.info(`Edit file ${fileId} clicked`);
    setDropdownFileId(null);
  };

  const handleDelete = (fileId: string) => {
    toast.error(`Delete file ${fileId} clicked`);
    setDropdownFileId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="my-6 text-3xl font-bold text-gray-800">Files</h1>
        <button
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon width={15} height={12} />
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg">
            <FileForm
              onClose={() => setShowForm(false)}
              type={type}
              referenceId={referenceId}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded shadow-sm">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-cyan-700 text-gray-100">
            <tr>
              <th className="px-3 py-2 border">#</th>
              <th className="px-3 py-2 border">Date</th>
              <th className="px-3 py-2 border">Title</th>
              <th className="px-3 py-2 border">Uploaded By</th>
              <th className="px-3 py-2 border">Send To</th>
              <th className="px-3 py-2 border">File</th>
              <th className="px-3 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files && files.length > 0 ? (
              files.map((file: AppFile, idx: number) => (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 relative"
                  onClick={() => setDropdownFileId(null)}
                >
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2">{formatDate(file.date)}</td>
                  <td className="border px-3 py-2 font-medium">{file.title}</td>
                  <td className="border px-3 py-2">
                    {file.uploadedByUser?.first_name}{" "}
                    {file.uploadedByUser?.last_name}
                  </td>
                  <td className="border px-3 py-2">
                    {file.sendToUser?.first_name} {file.sendToUser?.last_name}
                  </td>
                  <td className="border px-3 py-2">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.fileName}
                    </a>
                  </td>
                  <td className="border px-3 py-2">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownFileId(
                            dropdownFileId === file.id ? null : file.id
                          );
                        }}
                        className="flex items-center justify-between gap-1 px-3 py-1 bg-cyan-700 text-white rounded w-full hover:bg-cyan-800"
                      >
                        Actions
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownFileId === file.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 w-44 bg-white border rounded shadow-lg z-50"
                        >
                          <button
                            onClick={() => handleDownload(file.fileUrl)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                          <button
                            onClick={() => handlePreview(file.fileUrl)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> Preview
                          </button>
                          <button
                            onClick={() => handleEdit(file.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border px-3 py-2 text-center text-gray-500"
                >
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
