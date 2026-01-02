"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  Eye,
  Download,
  Edit,
  Trash2,
  PlusIcon,
  Search,
} from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { toast } from "react-toastify";
import FileForm from "../forms/FileForm";
import { AppFile } from "@/types/file";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileTableProps {
  type: "project" | "task" | "activity" | "todo";
  referenceId: string;
}

export default function FileTable({ type, referenceId }: FileTableProps) {
  const { data: files, isLoading, error } = useFiles();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columnOptions = [
    { value: "index", label: "#" },
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
    { value: "uploadedBy", label: "Uploaded By" },
    { value: "sendTo", label: "Send To" },
    { value: "file", label: "File" },
    { value: "actions", label: "Actions" },
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columnOptions.map((col) => col.value)
  );

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const formatDate = (date: string | Date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString();
    } catch {
      return String(date);
    }
  };

  const filtered = useMemo(() => {
    const list = (files ?? []).filter(
      (f) => f.type === type && String(f.referenceId) === String(referenceId)
    );
    if (!searchTerm) return list;
    return list.filter((f) =>
      f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.uploadedByUser?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.uploadedByUser?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, type, referenceId, searchTerm]);

  if (error) return <div className="text-red-500 py-4">Error loading files</div>;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
              <Skeleton className="h-10 w-full sm:w-24" />
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <div className="w-full sm:w-auto order-1 sm:order-2">
              <Skeleton className="h-10 w-full sm:w-48" />
            </div>
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-cyan-700">
              <TableRow>
                {columnOptions.slice(0, 5).map((col) => (
                  <TableHead key={col.value} className="text-white">
                    <Skeleton className="h-4 w-16 bg-cyan-600/50" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columnOptions.slice(0, 5).map((col) => (
                    <TableCell key={col.value}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handlePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const downloadColumns: Column<any>[] = [
    { header: "No", accessor: (_f, index) => index! + 1 },
    { header: "Date", accessor: (f: any) => formatDate(f.date) || "N/A" },
    { header: "Title", accessor: (f: any) => f.title || "N/A" },
    { header: "Uploaded By", accessor: (f: any) => `${f.uploadedByUser?.first_name} ${f.uploadedByUser?.last_name}` || "N/A" },
    { header: "Send To", accessor: (f: any) => `${f.sendToUser?.first_name} ${f.sendToUser?.last_name}` || "N/A" },
    { header: "File Name", accessor: (f: any) => f.fileName || "N/A" },
    { header: "File URL", accessor: (f: any) => f.fileUrl || "N/A" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Files</h2>
        <span className="text-sm text-gray-400 font-medium">({filtered.length} total)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto order-1 sm:order-2">
            <GenericDownloads
              data={filtered}
              title="Files"
              columns={downloadColumns}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  {columnOptions.map((col) => (
                    <div key={col.value} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`col-file-${col.value}`}
                        checked={selectedColumns.includes(col.value)}
                        onCheckedChange={() => toggleColumn(col.value)}
                      />
                      <label htmlFor={`col-file-${col.value}`} className="text-sm cursor-pointer flex-1">
                        {col.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              size="sm"
              className="h-9 bg-cyan-700 hover:bg-cyan-800 w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> New
            </Button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 w-full"
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <FileForm
              onClose={() => setShowForm(false)}
              type={type}
              referenceId={referenceId}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border shadow-sm">
        <Table>
          <TableHeader className="bg-cyan-700">
            <TableRow className="hover:bg-cyan-700">
              {columnOptions
                .filter((col) => selectedColumns.includes(col.value))
                .map((col) => (
                  <TableHead key={col.value} className="text-white font-semibold whitespace-nowrap px-4 py-3">
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((file: AppFile, idx: number) => (
                <TableRow key={file.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("index") && (
                    <TableCell className="px-4 py-3 text-gray-500">{idx + 1}</TableCell>
                  )}
                  {selectedColumns.includes("date") && (
                    <TableCell className="px-4 py-3 text-sm">{formatDate(file.date)}</TableCell>
                  )}
                  {selectedColumns.includes("title") && (
                    <TableCell className="px-4 py-3 font-medium text-gray-900">{file.title}</TableCell>
                  )}
                  {selectedColumns.includes("uploadedBy") && (
                    <TableCell className="px-4 py-3 text-sm">
                      {file.uploadedByUser?.first_name} {file.uploadedByUser?.last_name}
                    </TableCell>
                  )}
                  {selectedColumns.includes("sendTo") && (
                    <TableCell className="px-4 py-3 text-sm">
                      {file.sendToUser?.first_name} {file.sendToUser?.last_name}
                    </TableCell>
                  )}
                  {selectedColumns.includes("file") && (
                    <TableCell className="px-4 py-3 text-sm">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 hover:text-cyan-700 hover:underline font-medium"
                      >
                        {file.fileName}
                      </a>
                    </TableCell>
                  )}
                  {selectedColumns.includes("actions") && (
                    <TableCell className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 bg-cyan-700 text-white hover:bg-cyan-800">
                            Action <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleDownload(file.fileUrl)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePreview(file.fileUrl)}>
                            <Eye className="mr-2 h-4 w-4" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info(`Edit file ${file.id} clicked`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.error(`Delete file ${file.id} clicked`)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No files found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
