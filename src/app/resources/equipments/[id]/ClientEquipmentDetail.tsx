"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Equipment } from "@/types/equipment";

interface ClientEquipmentDetailProps {
  siteId: string;
}

export default function ClientEquipmentDetail({
  siteId,
}: ClientEquipmentDetailProps) {
  const router = useRouter();
  const {
    data: equipments,
    isLoading: eqLoading,
    error: eqError,
  } = useEquipments();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  if (eqLoading || siteLoading) return <div>Loading...</div>;
  if (eqError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // filter equipments by siteId
  const siteEquipment: Equipment[] =
    equipments?.filter((e) => e.siteId === siteId) ?? [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <button
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        onClick={() => router.push("/resources/sites")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Sites
      </button>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Equipment at “{site.name}”
      </h1>

      {siteEquipment.length === 0 ? (
        <p className="text-gray-600">No equipment found for this site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                {[
                  "#",
                  "Item",
                  "Type",
                  "Unit",
                  "Manufacturer",
                  "Model",
                  "Year",
                  "Quantity",
                  "Min Qty",
                  "Re‑Qty",
                  "Out of Store",
                  "Est Hours",
                  "Rate",
                  "Total Amount",
                  "OverTime",
                  "Condition",
                  "Owner",
                  "Status",
                  "Created At",
                  "Updated At",
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
              {siteEquipment.map((eq, idx) => (
                <tr key={eq.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/equipment/${eq.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {eq.item}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.type || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.unit}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.manufacturer || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.model || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.year || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.quantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.minQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.reorderQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.outOfStore ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.estimatedHours ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.rate ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.totalAmount ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.overTime ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.condition || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.owner || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.status || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.createdAt
                      ? new Date(eq.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.updatedAt
                      ? new Date(eq.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
