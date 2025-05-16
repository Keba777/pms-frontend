"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Material } from "@/types/material";
import { Warehouse } from "@/types/warehouse";
import { Site } from "@/types/site";

interface ClientMaterialDetailProps {
  siteId: string;
}

export default function ClientMaterialDetail({
  siteId,
}: ClientMaterialDetailProps) {
  const router = useRouter();
  const { data: materials, isLoading: matLoading, error: matError } =
    useMaterials();
  const { data: warehouses, isLoading: whLoading, error: whError } =
    useWarehouses();
  const { data: sites, isLoading: siteLoading, error: siteError } =
    useSites();

  if (matLoading || whLoading || siteLoading) return <div>Loading...</div>;
  if (matError || whError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site: Site | undefined = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // get all warehouses at this site
  const siteWarehouseIds = warehouses
    ?.filter((w: Warehouse) => w.siteId === siteId)
    .map((w) => w.id) ?? [];

  // then filter materials stored in those warehouses
  const siteMaterials: Material[] =
    materials?.filter((m) => m.warehouseId && siteWarehouseIds.includes(m.warehouseId)) ??
    [];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <button
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        onClick={() => router.push("/resources/sites")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Sites
      </button>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Materials at “{site.name}”
      </h1>

      {siteMaterials.length === 0 ? (
        <p className="text-gray-600">No materials found for this site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Item
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Unit
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Out of Store
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Re‑Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {siteMaterials.map((mat, idx) => (
                <tr key={mat.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {/* Link to single material detail if desired */}
                    <Link
                      href={`/resources/materials/${mat.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {mat.item}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.unit}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.quantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.outOfStore ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.reorderQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.status ?? "-"}
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
