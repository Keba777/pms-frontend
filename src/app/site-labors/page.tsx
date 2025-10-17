"use client";

import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useLabors } from "@/hooks/useLabors";
import { useCreateLabor } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Labor, CreateLaborInput, LooseLaborInput } from "@/types/labor";
import { getDuration } from "@/utils/helper";
import LaborForm from "@/components/forms/LaborForm";
import { useAuthStore } from "@/store/authStore";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LaborsPage = () => {
  const { user } = useAuthStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const siteId = user!.siteId;

  const { data: labors, isLoading: labLoading, error: labError } = useLabors();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  const [showForm, setShowForm] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const { mutateAsync: createLaborAsync } = useCreateLabor(() => {});

  const canCreate = hasPermission("labors", "create");
  const canManage = hasPermission("labors", "manage");

  // Filter labors by site with memoization to prevent unnecessary recalculations
  const siteLabors = useMemo(
    () => labors?.filter((l) => l.siteId === siteId) ?? [],
    [labors, siteId]
  );

  // Filtered list based on filters and dates
  const filteredLabors = useMemo(
    () =>
      siteLabors.filter(
        (l) =>
          Object.entries(filterValues).every(([key, value]) => {
            if (!value) return true;
            if (key === "allocationStatus") {
              return l.allocationStatus === value;
            }
            if (key === "role") {
              return l.role
                .toLowerCase()
                .includes((value as string).toLowerCase());
            }
            return true;
          }) &&
          (fromDate
            ? l.startingDate && new Date(l.startingDate) >= fromDate
            : true) &&
          (toDate ? l.dueDate && new Date(l.dueDate) <= toDate : true)
      ),
    [filterValues, siteLabors, fromDate, toDate]
  );

  // Loading / error guards
  if (labLoading || siteLoading) return <div>Loading...</div>;
  if (labError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // Define download columns
  const columns: Column<Labor>[] = [
    { header: "Role", accessor: "role" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: (row: Labor) => row.quantity ?? 0 },
    { header: "Min Qty", accessor: (row: Labor) => row.minQuantity ?? 0 },
    {
      header: "Est Hours",
      accessor: (row: Labor) => row.estimatedHours ?? 0,
    },
    { header: "Rate", accessor: (row: Labor) => row.rate ?? 0 },
    { header: "OT Rate", accessor: (row: Labor) => row.overtimeRate ?? 0 },
    {
      header: "Total Amount",
      accessor: (row: Labor) => row.totalAmount ?? 0,
    },
    {
      header: "Starting Date",
      accessor: (row: Labor) =>
        row.startingDate
          ? new Date(row.startingDate).toISOString().split("T")[0]
          : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Labor) =>
        row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "-",
    },
    {
      header: "Duration",
      accessor: (row: Labor) =>
        row.startingDate && row.dueDate
          ? String(getDuration(row.startingDate, row.dueDate))
          : "-",
    },
    { header: "Status", accessor: (row: Labor) => row.allocationStatus || "-" },
  ];

  const importColumns: ImportColumn<LooseLaborInput>[] = [
    { header: "Role", accessor: "role", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Qty", accessor: "quantity", type: "string" },
    { header: "Min Qty", accessor: "minQuantity", type: "string" },
    {
      header: "Est Hours",
      accessor: "estimatedHours",
      type: "string",
    },
    { header: "Rate", accessor: "rate", type: "string" },
    { header: "OT Rate", accessor: "overtimeRate", type: "string" },
    { header: "Total Amount", accessor: "totalAmount", type: "string" },
    { header: "Starting Date", accessor: "startingDate", type: "string" },
    { header: "Due Date", accessor: "dueDate", type: "string" },
    { header: "Status", accessor: "allocationStatus", type: "string" },
  ];

  const requiredAccessors: (keyof LooseLaborInput)[] = ["role", "unit"];

  const allocationOptions: Option<string>[] = [
    { label: "Allocated", value: "Allocated" },
    { label: "Unallocated", value: "Unallocated" },
    { label: "On Leave", value: "OnLeave" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "role",
      label: "Role",
      type: "text",
      placeholder: "Search by role…",
    },
    {
      name: "allocationStatus",
      label: "All Statuses",
      type: "select",
      options: allocationOptions,
    },
  ];

  const processLaborData = (data: LooseLaborInput[]): CreateLaborInput[] => {
    return data.map((laborRow) => {
      const processed: Record<string, unknown> = { ...laborRow, siteId };

      const numberFields: (keyof CreateLaborInput)[] = [
        "quantity",
        "minQuantity",
        "estimatedHours",
        "rate",
        "overtimeRate",
        "totalAmount",
      ];
      numberFields.forEach((field) => {
        const val = processed[field];
        if (val === "-" || val === "" || val == null) {
          processed[field] = undefined;
        } else {
          const num = Number(val);
          processed[field] = isNaN(num) ? undefined : num;
        }
      });

      if (processed.minQuantity === undefined) {
        processed.minQuantity = 1;
      }

      const dateFields: (keyof CreateLaborInput)[] = [
        "startingDate",
        "dueDate",
      ];
      dateFields.forEach((field) => {
        const val = processed[field];
        if (val === "-" || val === "" || val == null) {
          processed[field] = undefined;
        } else {
          const date = new Date(String(val));
          processed[field] = isNaN(date.getTime()) ? undefined : date;
        }
      });

      return processed as unknown as CreateLaborInput;
    });
  };

  const handleImport = async (data: LooseLaborInput[]) => {
    try {
      const processedData = processLaborData(data);

      const validAllocation = ["Allocated", "Unallocated", "OnLeave"];

      for (let i = 0; i < processedData.length; i++) {
        const labor = processedData[i];
        if (
          labor.allocationStatus &&
          !validAllocation.includes(labor.allocationStatus)
        ) {
          toast.error(
            `Invalid allocation status in row ${
              i + 2
            }. Must be one of: ${validAllocation.join(", ")}`
          );
          return;
        }
      }

      await Promise.all(processedData.map((labor) => createLaborAsync(labor)));
      toast.success("Labors imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating labors");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <nav className="hidden md:block" aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm sm:text-base">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Labors</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {canCreate && (
            <button
              type="button"
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
              onClick={() => setShowForm(true)}
              title="Create Labor"
            >
              <span className="md:hidden">Add New</span>
              <Plus className="w-4 h-4 hidden md:inline" />
            </button>
          )}
          {canManage && (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <GenericDownloads
                data={filteredLabors}
                title={`Labors_${site.name}`}
                columns={columns}
              />
            </div>
          )}
        </div>
      </div>

      {/* Import */}
      <div className="flex justify-end mb-4">
        {canManage && (
          <GenericImport<LooseLaborInput>
            expectedColumns={importColumns}
            requiredAccessors={requiredAccessors}
            onImport={handleImport}
            title="Labors"
            onError={handleError}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && canCreate && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <LaborForm siteId={siteId} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        <DatePicker
          selected={fromDate}
          onChange={setFromDate}
          placeholderText="From Date"
          className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          dateFormat="yyyy-MM-dd"
        />
        <DatePicker
          selected={toDate}
          onChange={setToDate}
          placeholderText="To Date"
          className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Labor at &quot;{site.name}&quot;
      </h1>

      {filteredLabors.length === 0 ? (
        <p className="text-gray-600">No labor entries match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                {[
                  "#",
                  "Role",
                  "Unit",
                  "Qty",
                  "Min Qty",
                  "Est-Hrs",
                  "Rate",
                  "OT",
                  "Total Amount",
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
              {filteredLabors.map((l, idx) => (
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
                    {l.quantity ?? 0}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.minQuantity ?? 0}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.estimatedHours ?? 0}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.rate ?? 0}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.overtimeRate ?? 0}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.totalAmount ?? 0}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.startingDate
                      ? new Date(l.startingDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.dueDate ? new Date(l.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {l.startingDate && l.dueDate
                      ? getDuration(l.startingDate, l.dueDate)
                      : "-"}
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
