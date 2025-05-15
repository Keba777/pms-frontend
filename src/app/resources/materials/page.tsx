"use client";

import React from "react";
import { useMaterials } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";

const ResourceMaterialsPage: React.FC = () => {
  const { data: materials, isLoading, error } = useMaterials();
  const { data: warehouses, isLoading: whLoading } = useWarehouses();
  const { data: sites, isLoading: siteLoading } = useSites();

  if (isLoading || whLoading || siteLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading materials.</div>;

  const headers = [
    "ID",
    "Warehouse Site",
    "Total Item",
    "Out of Store",
    "Re-Qty",
    "Responsible Person",
    "Status",
  ];

  // Lookup helpers
  const lookupWarehouse = (id?: string) => warehouses?.find((w) => w.id === id);
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
            <li className="text-gray-900 font-semibold">Materials</li>
          </ol>
        </nav>
      </div>

      {/* Materials Table */}
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
            {materials && materials.length > 0 ? (
              materials.map((mat, idx) => {
                const wh = lookupWarehouse(mat.warehouseId);
                const site = lookupSite(wh?.siteId);
                return (
                  <tr key={mat.id}>
                    <td className="px-4 py-2 border border-gray-200">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {site?.name || "Unknown Site"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {materials.length}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.outOfStore}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.reorderQuantity}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {wh?.owner || "Unknown Owner"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.status}
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
                  No materials available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceMaterialsPage;
