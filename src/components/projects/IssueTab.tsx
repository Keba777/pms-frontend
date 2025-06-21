"use client";

import React, { useState } from "react";
import { useIssues, useDeleteIssue } from "@/hooks/useIssues";
import { Issue } from "@/types/issue";
import IssueForm from "../forms/IssueForm";
import { useAuthStore } from "@/store/authStore";
import { PlusIcon } from "lucide-react";

interface IssueTabProps {
  projectId: string;
}

export default function IssueTab({ projectId }: IssueTabProps) {
  const { data: issues, isLoading, isError } = useIssues();
  const deleteMutation = useDeleteIssue();
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthStore();

  if (isLoading) return <p>Loading issues…</p>;
  if (isError) return <p>Failed to load issues.</p>;

  // Only show issues for this project
  const filtered = issues?.filter((i) => i.projectId === projectId) ?? [];

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon width={15} height={12} />
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <IssueForm
              raisedById={user!.id}
              projectId={projectId}
              siteId={user?.siteId}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      <h2 className="text-2xl font-semibold mb-4">Issues</h2>

      <div className="overflow-x-auto">
        <table className="min-w-max w-full border-collapse">
          <thead>
            <tr className="bg-cyan-700 text-white">
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">ID</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Description</th>
              <th className="border px-3 py-2">Raised By</th>
              <th className="border px-3 py-2">Priority</th>
              <th className="border px-3 py-2">Site</th>
              <th className="border px-3 py-2">Department</th>
              <th className="border px-3 py-2">Responsible</th>
              <th className="border px-3 py-2">Action Taken</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue: Issue, idx: number) => {
              const rcId = `RC${String(idx + 1).padStart(3, "0")}`;
              return (
                <tr key={issue.id} className="even:bg-gray-50">
                  <td className="border px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border px-3 py-2">{rcId}</td>
                  <td className="border px-3 py-2">
                    {new Date(issue.date).toLocaleDateString()}
                  </td>
                  <td className="border px-3 py-2">{issue.issueType}</td>
                  <td className="border px-3 py-2">{issue.description}</td>
                  <td className="border px-3 py-2">
                    {issue.raisedBy.first_name}
                  </td>
                  <td className="border px-3 py-2">{issue.priority}</td>
                  <td className="border px-3 py-2">
                    {issue.site?.name ?? "—"}
                  </td>
                  <td className="border px-3 py-2">
                    {issue.department?.name ?? "—"}
                  </td>
                  <td className="border px-3 py-2">
                    {issue.responsible?.first_name ?? "—"}
                  </td>
                  <td className="border px-3 py-2">
                    {issue.actionTaken ?? "—"}
                  </td>
                  <td className="border px-3 py-2">{issue.status}</td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => deleteMutation.mutate(issue.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td className="border px-3 py-2 text-center" colSpan={14}>
                  No issues found for this project.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
