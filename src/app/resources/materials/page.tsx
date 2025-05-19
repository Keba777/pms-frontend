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

  // Overall summary counts
  const totalAll = materials?.length ?? 0;
  const outOfStoreAll =
    materials?.filter((m) => m.status === "Active").length ?? 0;
  const reQtyAll = totalAll - outOfStoreAll;

  // Aggregate materials by site
  const aggregated: Record<
    string,
    {
      site: { id: string; name: string };
      totalItems: number;
      outOfStore: number;
      responsiblePerson: string;
      status: string;
    }
  > = {};

  materials?.forEach((mat) => {
    const wh = lookupWarehouse(mat.warehouseId);
    const site = wh && lookupSite(wh.siteId);
    if (!site || !wh) return;
    const sid = site.id;

    if (!aggregated[sid]) {
      aggregated[sid] = {
        site,
        totalItems: 0,
        outOfStore: 0,
        responsiblePerson: wh.owner || "Unknown Owner",
        status: wh.status || "Unknown Status",
      };
    }

    aggregated[sid].totalItems += 1;
    if (mat.status === "Active") aggregated[sid].outOfStore += 1;
  });

  const rows = Object.values(aggregated).map((item, idx) => ({
    id: idx + 1,
    site: item.site,
    totalItems: item.totalItems,
    outOfStore: item.outOfStore,
    reQty: item.totalItems - item.outOfStore,
    responsiblePerson: item.responsiblePerson,
    status: item.status,
  }));

  return (
    <div>
      {/* Breadcrumb */}
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

      {/* Overall Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total Items", value: totalAll },
          { label: "Out of Store", value: outOfStoreAll },
          { label: "Re-Qty", value: reQtyAll },
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

      {/* Aggregated Materials Table */}
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
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2 border border-gray-200">{row.id}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/materials/${row.site.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.site.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.totalItems}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.outOfStore}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.reQty}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.responsiblePerson}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.status}
                  </td>
                </tr>
              ))
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
