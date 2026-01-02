"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus as PlusIcon, Search, Eye, Edit, Trash2 } from "lucide-react";

import { useIssues, useDeleteIssue, useUpdateIssue } from "@/hooks/useIssues";
import { Issue } from "@/types/issue";
import IssueForm from "../forms/IssueForm";
import EditIssueForm from "@/components/forms/EditIssueForm";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { useAuthStore } from "@/store/authStore";
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

interface IssueTabProps {
  projectId: string;
}

const priorityBadgeClasses: Record<string, string> = {
  Urgent: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusBadgeClasses: Record<string, string> = {
  Open: "bg-gray-100 text-gray-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-blue-100 text-blue-800",
  Closed: "bg-green-100 text-green-800",
};

export default function IssueTab({ projectId }: IssueTabProps) {
  const router = useRouter();
  const { data: issues, isLoading, isError } = useIssues();
  const { mutate: deleteIssue } = useDeleteIssue();
  const { mutate: updateIssue } = useUpdateIssue();

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const { user } = useAuthStore();

  const columnOptions = [
    { value: "index", label: "#" },
    { value: "id", label: "ID" },
    { value: "date", label: "Date" },
    { value: "type", label: "Type" },
    { value: "description", label: "Description" },
    { value: "raisedBy", label: "Raised By" },
    { value: "priority", label: "Priority" },
    { value: "site", label: "Site" },
    { value: "department", label: "Department" },
    { value: "responsible", label: "Responsible" },
    { value: "actionTaken", label: "Action Taken" },
    { value: "status", label: "Status" },
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

  const filtered = useMemo(() => {
    const list = issues?.filter((i) => String(i.projectId) === String(projectId)) ?? [];
    if (!searchTerm) return list;
    return list.filter((i) =>
      i.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.raisedBy?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [issues, projectId, searchTerm]);

  if (isError) return <div className="text-red-500 py-4">Failed to load issues.</div>;

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
                {columnOptions.slice(0, 6).map((col) => (
                  <TableHead key={col.value} className="text-white">
                    <Skeleton className="h-4 w-16 bg-cyan-600/50" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columnOptions.slice(0, 6).map((col) => (
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

  const downloadColumns: Column<any>[] = [
    { header: "No", accessor: (_i, index) => index! + 1 },
    { header: "ID", accessor: (i: any) => i.id || "N/A" },
    { header: "Date", accessor: (i: any) => i.date ? new Date(i.date).toLocaleDateString() : "N/A" },
    { header: "Type", accessor: (i: any) => i.issueType || "N/A" },
    { header: "Description", accessor: (i: any) => i.description || "N/A" },
    { header: "Raised By", accessor: (i: any) => i.raisedBy?.first_name || "N/A" },
    { header: "Priority", accessor: (i: any) => i.priority || "N/A" },
    { header: "Site", accessor: (i: any) => i.site?.name || "N/A" },
    { header: "Department", accessor: (i: any) => i.department?.name || "N/A" },
    { header: "Responsible", accessor: (i: any) => i.responsible?.first_name || "N/A" },
    { header: "Action Taken", accessor: (i: any) => i.actionTaken || "N/A" },
    { header: "Status", accessor: (i: any) => i.status || "N/A" },
  ];

  const handleEditSubmit = (data: any) => {
    updateIssue(data);
    setShowEditForm(false);
    setIssueToEdit(null);
  };

  const openDeleteModal = (id: string) => {
    setSelectedIssueId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedIssueId) return;
    deleteIssue(selectedIssueId);
    setIsDeleteModalOpen(false);
    setSelectedIssueId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Issues</h2>
        <span className="text-sm text-gray-400 font-medium">({filtered.length} total)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto order-1 sm:order-2">
            <GenericDownloads
              data={filtered}
              title="Issues"
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
                        id={`col-issue-${col.value}`}
                        checked={selectedColumns.includes(col.value)}
                        onCheckedChange={() => toggleColumn(col.value)}
                      />
                      <label htmlFor={`col-issue-${col.value}`} className="text-sm cursor-pointer flex-1">
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
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 w-full"
          />
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <IssueForm
              raisedById={user!.id}
              projectId={projectId}
              siteId={user?.siteId}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showEditForm && issueToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <EditIssueForm
              issue={issueToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => {
                setShowEditForm(false);
                setIssueToEdit(null);
              }}
            />
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this issue?"
          confirmText="DELETE"
          confirmButtonText="Delete"
          showInput={false}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedIssueId(null);
          }}
          onConfirm={handleDelete}
        />
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
              filtered.map((issue: Issue, idx: number) => {
                const rcId = `RC${String(idx + 1).padStart(3, "0")}`;
                return (
                  <TableRow key={issue.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("index") && (
                      <TableCell className="px-4 py-3 text-gray-500">{idx + 1}</TableCell>
                    )}
                    {selectedColumns.includes("id") && (
                      <TableCell className="px-4 py-3 font-medium text-gray-900">{rcId}</TableCell>
                    )}
                    {selectedColumns.includes("date") && (
                      <TableCell className="px-4 py-3 text-sm">
                        {issue.date ? new Date(issue.date).toLocaleDateString() : "-"}
                      </TableCell>
                    )}
                    {selectedColumns.includes("type") && (
                      <TableCell className="px-4 py-3 text-sm">{issue.issueType ?? "-"}</TableCell>
                    )}
                    {selectedColumns.includes("description") && (
                      <TableCell className="px-4 py-3 text-sm max-w-xs truncate">{issue.description ?? "-"}</TableCell>
                    )}
                    {selectedColumns.includes("raisedBy") && (
                      <TableCell className="px-4 py-3 text-sm">{issue.raisedBy?.first_name ?? "-"}</TableCell>
                    )}
                    {selectedColumns.includes("priority") && (
                      <TableCell className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadgeClasses[issue.priority ?? ""] ?? "bg-gray-100 text-gray-800"}`}>
                          {issue.priority ?? "-"}
                        </span>
                      </TableCell>
                    )}
                    {selectedColumns.includes("site") && (
                      <TableCell className="px-4 py-3 text-sm">{issue.site?.name ?? "—"}</TableCell>
                    )}
                    {selectedColumns.includes("department") && (
                      <TableCell className="px-4 py-3 text-sm">{issue.department?.name ?? "—"}</TableCell>
                    )}
                    {selectedColumns.includes("responsible") && (
                      <TableCell className="px-4 py-3 text-sm">{issue.responsible?.first_name ?? "—"}</TableCell>
                    )}
                    {selectedColumns.includes("actionTaken") && (
                      <TableCell className="px-4 py-3 text-sm max-w-xs truncate">{issue.actionTaken ?? "—"}</TableCell>
                    )}
                    {selectedColumns.includes("status") && (
                      <TableCell className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadgeClasses[issue.status ?? ""] ?? "bg-gray-100 text-gray-800"}`}>
                          {issue.status ?? "-"}
                        </span>
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
                            <DropdownMenuItem onClick={() => router.push(`/issues/${issue.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setIssueToEdit(issue); setShowEditForm(true); }}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteModal(issue.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={selectedColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No issues found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
