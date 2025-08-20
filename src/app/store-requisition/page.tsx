// app/store-requisitions/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useStoreRequisitions } from "@/hooks/useStoreRequisition";
import { StoreRequisition } from "@/types/storeRequisition";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/common/ui/SearchInput";

const columnOptions: Record<keyof StoreRequisition, string> = {
  id: "ID",
  description: "Description",
  unitOfMeasure: "Unit of Measure",
  quantity: "Quantity",
  remarks: "Remarks",
  approvalId: "Approval ID",
  createdAt: "Created At",
  updatedAt: "Updated At",
  approval: "",
};

export default function StoreRequisitionPage() {
  const { data: requisitions = [], isLoading, error } = useStoreRequisitions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<
    (keyof StoreRequisition)[]
  >(["description", "unitOfMeasure", "quantity", "remarks", "approvalId"]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close column menu on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (isLoading)
    return <p className="p-4 text-gray-600">Loading store requisitions...</p>;
  if (error) return <div className="p-4 text-red-600">Error loading data.</div>;

  // Filtered list
  const filtered = requisitions.filter(
    (r) =>
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.approvalId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCol = (col: keyof StoreRequisition) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // Build columns config for GenericDownloads
  const downloadColumns: Column<StoreRequisition>[] = selectedColumns.map(
    (col) => ({
      header: columnOptions[col],
      accessor: (row) => {
        const v = row[col];
        if (
          (col === "createdAt" || col === "updatedAt") &&
          typeof v === "string"
        ) {
          return new Date(v).toLocaleString();
        }
        return v ?? "";
      },
    })
  );

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Customize Columns */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => {
                const col = key as keyof StoreRequisition;
                return (
                  <label
                    key={key}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleCol(col)}
                      className="mr-2"
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Search + Downloads */}
        <div className="flex items-center space-x-2">
          <SearchInput
            placeholder="Search description or approval ID…"
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <GenericDownloads
            data={filtered}
            title="Store_Requisitions"
            columns={downloadColumns}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectedColumns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-sm font-semibold text-gray-700"
                >
                  {columnOptions[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.length > 0 ? (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  {selectedColumns.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm text-gray-800">
                      {col === "createdAt" || col === "updatedAt"
                        ? new Date(r[col] as unknown as string).toLocaleString()
                        : r[col]?.toString() ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No store requisitions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
