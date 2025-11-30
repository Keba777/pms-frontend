"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown, Plus as PlusIcon } from "lucide-react";

import { useIssues, useDeleteIssue, useUpdateIssue } from "@/hooks/useIssues";
import { Issue } from "@/types/issue";
import IssueForm from "../forms/IssueForm";
import EditIssueForm from "@/components/forms/EditIssueForm";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { useAuthStore } from "@/store/authStore";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";

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
  const deleteMutation = useDeleteIssue();
  const { mutate: deleteIssue } = deleteMutation; // shorthand
  const { mutate: updateIssue } = useUpdateIssue();

  const [showForm, setShowForm] = useState(false); // create form
  const [showEditForm, setShowEditForm] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const { user } = useAuthStore();

  if (isLoading) return <p>Loading issues…</p>;
  if (isError) return <p>Failed to load issues.</p>;

  // Filter to this project
  const filtered = issues?.filter((i) => i.projectId === projectId) ?? [];

  // Downloads columns
  const downloadColumns: Column<any>[] = [
    { header: "No", accessor: (_i, index) => index! + 1 },
    { header: "ID", accessor: (i: any) => i.id || "N/A" },
    {
      header: "Date",
      accessor: (i: any) =>
        i.date ? new Date(i.date).toLocaleDateString() : "N/A",
    },
    { header: "Type", accessor: (i: any) => i.issueType || "N/A" },
    { header: "Description", accessor: (i: any) => i.description || "N/A" },
    {
      header: "Raised By",
      accessor: (i: any) => i.raisedBy?.first_name || "N/A",
    },
    { header: "Priority", accessor: (i: any) => i.priority || "N/A" },
    { header: "Site", accessor: (i: any) => i.site?.name || "N/A" },
    {
      header: "Department",
      accessor: (i: any) => i.department?.name || "N/A",
    },
    {
      header: "Responsible",
      accessor: (i: any) => i.responsible?.first_name || "N/A",
    },
    { header: "Action Taken", accessor: (i: any) => i.actionTaken || "N/A" },
    { header: "Status", accessor: (i: any) => i.status || "N/A" },
  ];

  // Actions
  const handleView = (id: string) => {
    router.push(`/issues/${id}`);
  };

  const handleEditClick = (issue: Issue) => {
    setIssueToEdit(issue);
    setShowEditForm(true);
  };

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
    <div className="max-w-full">
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center gap-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
            aria-label="Add issue"
          >
            <PlusIcon width={15} height={12} />
            <span className="hidden sm:inline">New</span>
          </button>
          <GenericDownloads data={filtered} title="Issues" columns={downloadColumns} />
        </div>
      </div>

      {/* Create Issue Modal */}
      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <IssueForm
              raisedById={user!.id}
              projectId={projectId}
              siteId={user?.siteId}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {showEditForm && issueToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
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

      {/* Delete Confirmation Modal */}
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

      <h2 className="text-2xl font-semibold mb-4">Issues</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">#</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Raised By</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Priority</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Site</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Department</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Responsible</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Action Taken</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 && (
              <tr>
                <td className="border px-4 py-2 text-center" colSpan={13}>
                  No issues found for this project.
                </td>
              </tr>
            )}

            {filtered.map((issue: Issue, idx: number) => {
              const rcId = `RC${String(idx + 1).padStart(3, "0")}`;
              return (
                <tr key={issue.id} className="even:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                  <td className="px-4 py-2 border border-gray-200">{rcId}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.date ? new Date(issue.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">{issue.issueType ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{issue.description ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{issue.raisedBy?.first_name ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[issue.priority ?? ""] ?? "bg-gray-100 text-gray-800"}`}>
                      {issue.priority ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">{issue.site?.name ?? "—"}</td>
                  <td className="px-4 py-2 border border-gray-200">{issue.department?.name ?? "—"}</td>
                  <td className="px-4 py-2 border border-gray-200">{issue.responsible?.first_name ?? "—"}</td>
                  <td className="px-4 py-2 border border-gray-200">{issue.actionTaken ?? "—"}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[issue.status ?? ""] ?? "bg-gray-100 text-gray-800"}`}>
                      {issue.status ?? "-"}
                    </span>
                  </td>

                  <td className="px-4 py-2 border border-gray-200 text-center">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>

                      <MenuItems className="absolute left-0 mt-2 w-40 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                        <div className="py-1">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleView(issue.id)}
                                className={`${active ? "bg-gray-100" : ""} w-full text-left px-3 py-2 text-sm text-gray-700`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>

                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleEditClick(issue)}
                                className={`${active ? "bg-gray-100" : ""} w-full text-left px-3 py-2 text-sm text-gray-700`}
                              >
                                Edit
                              </button>
                            )}
                          </MenuItem>

                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => openDeleteModal(issue.id)}
                                className={`${active ? "bg-gray-100" : ""} w-full text-left px-3 py-2 text-sm text-red-600`}
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
