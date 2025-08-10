"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import { Material } from "@/types/material";
import { Warehouse } from "@/types/warehouse";
import { Site } from "@/types/site";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";

interface ClientMaterialDetailProps {
  siteId: string;
}

const statusBadgeClasses: Record<Material["status"], string> = {
  Available: "bg-green-100 text-green-800",
  Unavailable: "bg-red-100 text-red-800",
};

const columnOptions: Record<string, string> = {
  id: "ID",
  item: "Item Name",
  type: "Type",
  unit: "Unit",
  quantity: "Qty",
  totalPrice: "Unit Price",
  reorderQuantity: "Re-Qty",
  shelfNo: "Shelf No",
  status: "Status",
};

export default function ClientMaterialDetail({
  siteId,
}: ClientMaterialDetailProps) {
  const router = useRouter();
  const {
    data: materials,
    isLoading: matLoading,
    error: matError,
  } = useMaterials();
  const {
    data: warehouses,
    isLoading: whLoading,
    error: whError,
  } = useWarehouses();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  // Column selection state
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Close column menu when clicking outside
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    });
    return () => document.removeEventListener("mousedown", () => {});
  }, []);

  // Get site and warehouse data
  const site: Site | undefined = sites?.find((s) => s.id === siteId);
  const siteWarehouseIds =
    warehouses
      ?.filter((w: Warehouse) => w.siteId === siteId)
      .map((w) => w.id) ?? [];

  // Filter materials stored in those warehouses
  const filteredMaterials = useMemo(() => {
    let siteMaterials: Material[] =
      materials?.filter(
        (m) => m.warehouseId && siteWarehouseIds.includes(m.warehouseId)
      ) ?? [];

    return siteMaterials.filter((m: Material) => {
      let matches = true;
      if (filterValues.item) {
        matches =
          matches &&
          m.item
            .toLowerCase()
            .includes((filterValues.item as string).toLowerCase());
      }
      if (filterValues.status) {
        matches = matches && m.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, materials, siteWarehouseIds]);

  // Early returns after all Hooks
  if (matLoading || whLoading || siteLoading) return <div>Loading...</div>;
  if (matError || whError || siteError)
    return <div className="text-red-500">Error loading data.</div>;
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // Status summary values
  const total = filteredMaterials?.length ?? 0;
  const allocated =
    filteredMaterials?.filter((l) => l.status === "Available").length ?? 0;
  const unallocated =
    filteredMaterials?.filter((l) => l.status === "Unavailable").length ?? 0;

  // Define download columns
  const columns: Column<Material>[] = [
    { header: "ID", accessor: (row: Material) => row.id },
    { header: "Item Name", accessor: "item" },
    { header: "Type", accessor: (row: Material) => row.type || "-" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: (row: Material) => row.quantity ?? "-" },
    {
      header: "Unit Price",
      accessor: (row: Material) => row.totalPrice ?? "-",
    },
    {
      header: "Re-Qty",
      accessor: (row: Material) => row.reorderQuantity ?? "-",
    },
    { header: "Shelf No", accessor: (row: Material) => row.shelfNo ?? "-" },
    { header: "Status", accessor: (row: Material) => row.status ?? "-" },
  ];

  // Filter options
  const statusOptions: Option<string>[] = [
    { label: "Available", value: "Available" },
    { label: "Unavailable", value: "Unavailable" },
  ];

  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "item",
      label: "Item Name",
      type: "text",
      placeholder: "Search by item name…",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex justify-between mb-4">
        <button
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          onClick={() => router.push("/resources/materials")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Sites
        </button>
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Materials at “{site.name}”
      </h1>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Available", value: allocated },
          { label: "Out of Store", value: unallocated },
        ].map((item) => (
          <div
            key={item.label}
            className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="mr-2">{item.label} =</h2>
            <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Top Actions */}
      <div className="flex justify-end mb-8">
        <GenericDownloads
          data={filteredMaterials}
          title={`Materials_${site.name}`}
          columns={columns}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="mr-2"
                  />
                  {label || <span>&nbsp;</span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <GenericFilter
            fields={filterFields}
            onFilterChange={setFilterValues}
          />
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <p className="text-gray-600">No materials found for this site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                {selectedColumns.includes("id") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    ID
                  </th>
                )}
                {selectedColumns.includes("item") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Item Name
                  </th>
                )}
                {selectedColumns.includes("type") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Type
                  </th>
                )}
                {selectedColumns.includes("unit") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Unit
                  </th>
                )}
                {selectedColumns.includes("quantity") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Qty
                  </th>
                )}
                {selectedColumns.includes("totalPrice") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Unit Price
                  </th>
                )}
                {selectedColumns.includes("reorderQuantity") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Re-Qty
                  </th>
                )}
                {selectedColumns.includes("shelfNo") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Shelf No
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((mat, idx) => (
                <tr key={mat.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {`RC00${idx + 1}`}
                    </td>
                  )}
                  {selectedColumns.includes("item") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.item}
                    </td>
                  )}
                  {selectedColumns.includes("type") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.type || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.unit}
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.quantity ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("totalPrice") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.totalPrice ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("reorderQuantity") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.reorderQuantity ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("shelfNo") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.shelfNo ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          statusBadgeClasses[mat.status]
                        }`}
                      >
                        {mat.status || "-"}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}