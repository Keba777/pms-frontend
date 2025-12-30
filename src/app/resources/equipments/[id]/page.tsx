"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { useSites } from "@/hooks/useSites";
import { Equipment } from "@/types/equipment";
import { Site } from "@/types/site";
import { getDuration } from "@/utils/helper";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";

const statusBadgeClasses: Record<Equipment["status"], string> = {
  Available: "bg-green-100 text-green-800",
  Unavailable: "bg-red-100 text-red-800",
};

const columnOptions: Record<string, string> = {
  id: "ID",
  item: "Item",
  type: "Type",
  unit: "Unit",
  manufacturer: "Manufacturer",
  model: "Model",
  year: "Year",
  quantity: "Qty",
  estimatedHours: "Est Hours",
  rate: "Rate",
  totalAmount: "Total Amount",
  overTime: "OT",
  condition: "Condition",
  owner: "Owner",
  duration: "Duration",
  startingDate: "Starting Date",
  dueDate: "Due Date",
  status: "Status",
};

export default function EquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;
  const {
    data: equipments,
    isLoading: eqLoading,
    error: eqError,
  } = useEquipments();
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
    return () => document.removeEventListener("mousedown", () => { });
  }, []);

  // Get site data
  const site: Site | undefined = sites?.find((s) => s.id === siteId);

  // Filter equipments by siteId and filter values
  const filteredEquipments = useMemo(() => {
    const siteEquipment: Equipment[] =
      equipments?.filter((e) => e.siteId === siteId) ?? [];

    return siteEquipment.filter((e: Equipment) => {
      let matches = true;
      if (filterValues.item) {
        matches =
          matches &&
          e.item
            .toLowerCase()
            .includes((filterValues.item as string).toLowerCase());
      }
      if (filterValues.status) {
        matches = matches && e.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, equipments, siteId]);

  // Early returns after all Hooks
  if (eqLoading || siteLoading) return <div>Loading...</div>;
  if (eqError || siteError)
    return <div className="text-red-500">Error loading data.</div>;
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // Status summary values
  const total = filteredEquipments?.length ?? 0;
  const available =
    filteredEquipments?.filter((l) => l.status === "Available").length ?? 0;
  const unavailable =
    filteredEquipments?.filter((l) => l.status === "Unavailable").length ?? 0;
  const rental =
    filteredEquipments?.filter((l) => l.owner === "Rental").length ?? 0;
  const own =
    filteredEquipments?.filter((l) => l.owner === "Raycon").length ?? 0;

  // Define download columns
  const columns: Column<Equipment>[] = [
    { header: "ID", accessor: (row: Equipment) => row.id },
    { header: "Item", accessor: "item" },
    { header: "Type", accessor: (row: Equipment) => row.type || "-" },
    { header: "Unit", accessor: "unit" },
    {
      header: "Manufacturer",
      accessor: (row: Equipment) => row.manufacturer || "-",
    },
    { header: "Model", accessor: (row: Equipment) => row.model || "-" },
    { header: "Year", accessor: (row: Equipment) => row.year || "-" },
    { header: "Qty", accessor: (row: Equipment) => row.quantity ?? "-" },
    {
      header: "Est Hours",
      accessor: (row: Equipment) => row.estimatedHours ?? "-",
    },
    { header: "Rate", accessor: (row: Equipment) => row.rate ?? "-" },
    {
      header: "Total Amount",
      accessor: (row: Equipment) => row.totalAmount ?? "-",
    },
    { header: "OT", accessor: (row: Equipment) => row.overTime ?? "-" },
    { header: "Condition", accessor: (row: Equipment) => row.condition || "-" },
    { header: "Owner", accessor: (row: Equipment) => row.owner || "-" },
    {
      header: "Duration",
      accessor: (row: Equipment) =>
        row.createdAt && row.updatedAt
          ? getDuration(row.createdAt, row.updatedAt)
          : "-",
    },
    {
      header: "Starting Date",
      accessor: (row: Equipment) =>
        row.startingDate
          ? new Date(row.startingDate).toLocaleDateString()
          : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Equipment) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-",
    },
    { header: "Status", accessor: (row: Equipment) => row.status || "-" },
  ];

  // Filter options
  const statusOptions: Option<string>[] = [
    { label: "Allocated", value: "Allocated" },
    { label: "Unallocated", value: "Unallocated" },
    { label: "On Maintainance", value: "OnMaintainance" },
    { label: "Inactive", value: "InActive" },
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
          onClick={() => router.push("/resources/equipments")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Sites
        </button>
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Equipment at "{site.name}"
      </h1>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Available", value: available },
          { label: "Unavailable", value: unavailable },
          { label: "Rental", value: rental },
          { label: "Own", value: own },
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
          data={filteredEquipments}
          title={`Equipment_${site.name}`}
          columns={columns}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 border border-gray-200"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
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

      {filteredEquipments.length === 0 ? (
        <p className="text-gray-600">No equipment found for this site.</p>
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
                    Item
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
                {selectedColumns.includes("manufacturer") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Manufacturer
                  </th>
                )}
                {selectedColumns.includes("model") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Model
                  </th>
                )}
                {selectedColumns.includes("year") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Year
                  </th>
                )}
                {selectedColumns.includes("quantity") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Qty
                  </th>
                )}
                {selectedColumns.includes("estimatedHours") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Est Hours
                  </th>
                )}
                {selectedColumns.includes("rate") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Rate
                  </th>
                )}
                {selectedColumns.includes("totalAmount") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Total Amount
                  </th>
                )}
                {selectedColumns.includes("overTime") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    OT
                  </th>
                )}
                {selectedColumns.includes("condition") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Condition
                  </th>
                )}
                {selectedColumns.includes("owner") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Owner
                  </th>
                )}

                {selectedColumns.includes("createdAt") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Starting Date
                  </th>
                )}
                {selectedColumns.includes("updatedAt") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Due Date
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
              {filteredEquipments.map((eq, idx) => (
                <tr key={eq.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {`EQ00${idx + 1}`}
                    </td>
                  )}
                  {selectedColumns.includes("item") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.item}
                    </td>
                  )}
                  {selectedColumns.includes("type") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.type || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.unit}
                    </td>
                  )}
                  {selectedColumns.includes("manufacturer") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.manufacturer || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("model") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.model || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("year") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.year || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.quantity ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("estimatedHours") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.estimatedHours ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("rate") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.rate ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("totalAmount") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.totalAmount ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("overTime") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.overTime ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("condition") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.condition || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("owner") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.owner || "-"}
                    </td>
                  )}

                  {selectedColumns.includes("createdAt") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.startingDate
                        ? new Date(eq.startingDate).toLocaleDateString()
                        : "-"}
                    </td>
                  )}
                  {selectedColumns.includes("updatedAt") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.dueDate
                        ? new Date(eq.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[eq.status]
                          }`}
                      >
                        {eq.status || "-"}
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
