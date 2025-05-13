"use client";

import React from "react";
import { useLabors } from "@/hooks/useLabors";
import Link from "next/link";

const LaborPage = () => {
  const { data: labors, isLoading, error } = useLabors();

  if (isLoading) return <div>Loading labors...</div>;
  if (error) return <div>Error loading labors.</div>;

  const headers = [
    "ID",
    "Site Name",
    "Total Labor",
    "Allocated",
    "Unallocated",
    "On Leave",
    "Active",
    "Inactive",
    "Responsible Person",
  ];

  // Calculate status counts
  const total = labors?.length ?? 0;
  const allocated = labors?.filter((l) => l.allocationStatus === "Allocated").length ?? 0;
  const unallocated = labors?.filter((l) => l.allocationStatus === "Unallocated").length ?? 0;
  const onLeave = labors?.filter((l) => l.allocationStatus === "OnLeave").length ?? 0;
  const active = labors?.filter((l) => l.status === "Active").length ?? 0;
  const inactive = labors?.filter((l) => l.status === "InActive").length ?? 0;

  return (
    <div>
      {/* Breadcrumb & Add Button */}
      <div className="flex justify-between mb-4 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Labors</li>
          </ol>
        </nav>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total", value: total },
          { label: "Allocated", value: allocated },
          { label: "Unallocated", value: unallocated },
          { label: "On Leave", value: onLeave },
          { label: "Active", value: active },
          { label: "Inactive", value: inactive },
        ].map((item) => (
          <div
            key={item.label}
            className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="mr-2">{item.label} =</h2>
            <div className="flex items-center">
              <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Labor Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {labors && labors.length > 0 ? (
              labors.map((lab, idx) => (
                <tr key={lab.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.site?.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {total}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.allocationStatus === "Allocated" ? "Yes" : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.allocationStatus === "Unallocated" ? "Yes" : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.allocationStatus === "OnLeave" ? "Yes" : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.status === "Active" ? "Yes" : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.status === "InActive" ? "Yes" : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {lab.responsiblePerson}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-2 text-center border border-gray-200"
                >
                  No labor records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaborPage;
