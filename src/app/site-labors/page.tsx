"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useLabors } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Labor } from "@/types/labor";
import { getDuration } from "@/utils/helper";
import LaborForm from "@/components/forms/LaborForm";
import { useAuthStore } from "@/store/authStore";

// New imports for search & download
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/ui/SearchInput";

const LaborsPage = () => {
  const { user } = useAuthStore();
  const siteId = user!.siteId;
  const { data: labors, isLoading: labLoading, error: labError } = useLabors();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // filter labors by siteId (safe even during loading/errors)
  const siteLabors: Labor[] = labors?.filter((l) => l.siteId === siteId) ?? [];

  // filtered list based on searchQuery
  const filteredLabors = useMemo(
    () =>
      siteLabors.filter((l) =>
        l.role.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, siteLabors]
  );

  // define download columns
  const columns: Column<Labor>[] = [
    { header: "Role", accessor: "role" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: (row: Labor) => row.quantity ?? "-" },
    { header: "Min Qty", accessor: (row: Labor) => row.minQuantity ?? "-" },
    { header: "Est Hours", accessor: (row: Labor) => row.estimatedHours ?? "-" },
    { header: "Rate", accessor: (row: Labor) => row.rate ?? "-" },
    { header: "OT Rate", accessor: (row: Labor) => row.overtimeRate ?? "-" },
    { header: "Total Amount", accessor: (row: Labor) => row.totalAmount ?? "-" },
    {
      header: "Starting Date",
      accessor: (row: Labor) =>
        row.createdAt ? new Date(row.createdAt).toISOString().split("T")[0] : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Labor) =>
        row.updatedAt ? new Date(row.updatedAt).toISOString().split("T")[0] : "-",
    },
    {
      header: "Duration",
      accessor: (row: Labor) =>
        row.createdAt && row.updatedAt
          ? String(getDuration(row.createdAt, row.updatedAt))
          : "-",
    },
    { header: "Status", accessor: (row: Labor) => row.allocationStatus || "-" },
  ];

  // loading / error guards
  if (labLoading || siteLoading) return <div>Loading...</div>;
  if (labError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Top Actions: Search, Download, Create */}
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-4">
          <GenericDownloads
            data={filteredLabors}
            title={`Labors_${site.name}`}
            columns={columns}
          />
          <button
            type="button"
            className="px-3 py-3 text-white bg-cyan-700 rounded hover:bg-cyan-800"
            onClick={() => setShowForm(true)}
            title="Create Labor"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <LaborForm siteId={siteId} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Labor at “{site.name}”
      </h1>

      {filteredLabors.length === 0 ? (
        <p className="text-gray-600">No labor entries match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                {[
                  "#",
                  "Role",
                  "Unit",
                  "Qty",
                  "Min Qty",
                  "Est-Hrs",
                  "Rate",
                  "OT",
                  "Total Amount",
                  "Starting Date",
                  "Due Date",
                  "Duration",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLabors.map((l, idx) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/labor/${l.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {l.role}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">{l.unit}</td>
                  <td className="px-4 py-2 border border-gray-200">{l.quantity ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{l.minQuantity ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{l.estimatedHours ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{l.rate ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{l.overtimeRate ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">{l.totalAmount ?? "-"}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.createdAt && l.updatedAt ? getDuration(l.createdAt, l.updatedAt) : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">{l.allocationStatus ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LaborsPage;
