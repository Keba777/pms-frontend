"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useLabors } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Labor } from "@/types/labor";
import { getDuration } from "@/utils/helper";
import LaborForm from "@/components/forms/LaborForm";
import { useAuthStore } from "@/store/authStore";

const LaborsPage = () => {
  const { user } = useAuthStore();
  const siteId = user!.siteId;
  const { data: labors, isLoading: labLoading, error: labError } = useLabors();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();
  const [showForm, setShowForm] = useState(false);

  if (labLoading || siteLoading) return <div>Loading...</div>;
  if (labError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // filter labors by siteId
  const siteLabors: Labor[] = labors?.filter((l) => l.siteId === siteId) ?? [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="px-3 py-3 text-white bg-cyan-700 rounded hover:bg-cyan-800"
          onClick={() => setShowForm(true)}
          title="Create Material"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

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

      {siteLabors.length === 0 ? (
        <p className="text-gray-600">No labor entries found for this site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                {[
                  "#",
                  "Role",
                  "Unit",
                  "Qyt",
                  "Min Qty",
                  "Est-Hrs",
                  "Rate",
                  "OT",
                  "Total Amount",
                  // "Responsible Person",
                  // "Allocation Status",
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
              {siteLabors.map((l, idx) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/labor/${l.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {l.role}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">{l.unit}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.quantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.minQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.estimatedHours ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.rate ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.overtimeRate ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.totalAmount ?? "-"}
                  </td>
                  {/* <td className="px-4 py-2 border border-gray-200">
                      {l.skill_level ?? "-"}
                    </td> */}
                  {/* <td className="px-4 py-2 border border-gray-200">
                      {l.responsiblePerson ?? "-"}
                    </td> */}
                  {/* <td className="px-4 py-2 border border-gray-200">
                      {l.allocationStatus ?? "-"}
                    </td> */}

                  <td className="px-4 py-2 border border-gray-200">
                    {l.createdAt
                      ? new Date(l.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.updatedAt
                      ? new Date(l.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.createdAt &&
                      l.updatedAt &&
                      getDuration(l.createdAt, l.updatedAt)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.allocationStatus ?? "-"}
                  </td>
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
