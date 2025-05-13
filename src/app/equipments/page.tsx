"use client";

import React from "react";
import { useEquipments } from "@/hooks/useEquipments";
import Link from "next/link";
import { useSites } from "@/hooks/useSites";

const EquipmentPage = () => {
  const { data: equipments, isLoading, error } = useEquipments();
  const { data: sites } = useSites();

  if (isLoading) return <div>Loading equipment...</div>;
  if (error) return <div>Error loading equipment.</div>;

  const headers = [
    "ID",
    "Site Name",
    "Total Item",
    "Out of Store",
    "Re-Qty",
    "Responsible Person",
    "Status",
  ];

  const lookupSite = (siteId?: string) => sites?.find((s) => s.id === siteId);

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
            <li className="text-gray-900 font-semibold">Equipments</li>
          </ol>
        </nav>
      </div>

      {/* Equipment Table */}
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
            {equipments && equipments.length > 0 ? (
              equipments.map((eqp, idx) => {
                const site = lookupSite(eqp?.siteId);
                return (
                  <tr key={eqp.id}>
                    <td className="px-4 py-2 border border-gray-200">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {site?.name || "Unknown Site"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {equipments?.length || 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eqp.outOfStore}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eqp.reorderQuantity}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eqp.owner}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eqp.status}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-2 text-center border border-gray-200"
                >
                  No equipment records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentPage;
