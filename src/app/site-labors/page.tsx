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
import { LaborInformation } from "@/types/laborInformation";

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

  // Filtered list based on filters and dates (adjusted for laborInformations)
  const filteredLabors = useMemo(() => {
    return siteLabors
      .map((labor) => {
        let filteredInfos = labor.laborInformations || [];

        if (filterValues.role) {
          if (
            !labor.role
              .toLowerCase()
              .includes((filterValues.role as string).toLowerCase())
          ) {
            return null;
          }
        }

        if (filterValues.allocationStatus) {
          filteredInfos = filteredInfos.filter(
            (info) => info.status === filterValues.allocationStatus
          );
        }

        if (fromDate) {
          filteredInfos = filteredInfos.filter(
            (info) => info.startsAt && new Date(info.startsAt) >= fromDate
          );
        }

        if (toDate) {
          filteredInfos = filteredInfos.filter(
            (info) => info.endsAt && new Date(info.endsAt) <= toDate
          );
        }

        if (filteredInfos.length === 0) return null;

        return { ...labor, laborInformations: filteredInfos } as Labor & { laborInformations: LaborInformation[] };
      })
      .filter((l): l is Labor & { laborInformations: LaborInformation[] } => l !== null);
  }, [siteLabors, filterValues, fromDate, toDate]);

  // Flattened data for download
  const flattenedForDownload = useMemo(() => {
    return filteredLabors.flatMap((l) => {
      return l.laborInformations.map((info) => ({
        firstName: info.firstName,
        lastName: info.lastName,
        role: l.role,
        unit: l.unit,
        quantity: l.quantity ?? 0,
        minQuantity: l.minQuantity ?? 0,
        estimatedHours: l.estimatedHours ?? 0,
        rate: l.rate ?? 0,
        overtimeRate: l.overtimeRate ?? 0,
        totalAmount: l.totalAmount ?? 0,
        startingDate: info.startsAt
          ? new Date(info.startsAt).toISOString().split("T")[0]
          : "-",
        dueDate: info.endsAt
          ? new Date(info.endsAt).toISOString().split("T")[0]
          : "-",
        duration:
          info.startsAt && info.endsAt
            ? String(getDuration(info.startsAt, info.endsAt))
            : "-",
        status: info.status || "-",
      }));
    });
  }, [filteredLabors]);

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

  // Define download columns (updated for flattened format)
  const columns: Column<typeof flattenedForDownload[0]>[] = [
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Role", accessor: "role" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: "quantity" },
    { header: "Min Qty", accessor: "minQuantity" },
    { header: "Est Hours", accessor: "estimatedHours" },
    { header: "Rate", accessor: "rate" },
    { header: "OT Rate", accessor: "overtimeRate" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Starting Date", accessor: "startingDate" },
    { header: "Due Date", accessor: "dueDate" },
    { header: "Duration", accessor: "duration" },
    { header: "Status", accessor: "status" },
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

      if (processed.quantity === undefined) {
        processed.quantity = 1;
      }

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
                data={flattenedForDownload}
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
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 table-auto">
            <thead className="bg-cyan-700">
              <tr>
                {[
                  "#",
                  "First Name",
                  "Last Name",
                  "Role",
                  "Unit",
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
                    className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLabors.flatMap((l, laborIndex) => {
                return (
                  l.laborInformations.map((info, infoIndex) => (
                    <tr key={`${l.id}-${info.id}`}>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {laborIndex + 1}.{infoIndex + 1}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {info.firstName}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {info.lastName}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        <Link
                          href={`/site-labors/${l.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {l.role}
                        </Link>
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {l.unit}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {l.estimatedHours ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {l.rate ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {l.overtimeRate ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {l.totalAmount ?? "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {info.startsAt
                          ? new Date(info.startsAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {info.endsAt
                          ? new Date(info.endsAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {info.startsAt && info.endsAt
                          ? getDuration(info.startsAt, info.endsAt)
                          : "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 whitespace-nowrap">
                        {info.status ?? "-"}
                      </td>
                    </tr>
                  ))
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LaborsPage;
