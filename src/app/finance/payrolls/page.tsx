// PayrollsPage.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, PlusIcon } from "lucide-react";
import { usePayrolls } from "@/hooks/useFinancials";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Payroll } from "@/types/financial";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import PayrollForm from "@/components/forms/finance/PayrollForm";
import PayrollsTable from "@/components/finance/PayrollsTable";

const columnOptions: Record<string, string> = {
  user: "User",
  salary: "Salary",
  month: "Month",
  status: "Status",
  action: "Action",
};

const PayrollsPage = () => {
  const {
    data: payrolls,
    isLoading: payrollLoading,
    error: payrollError,
  } = usePayrolls();

  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close column menu when clicking outside
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    });
    return () => document.removeEventListener("mousedown", () => {});
  }, []);

  // Compute filteredPayrolls using useMemo, with a fallback for when payrolls is undefined
  const filteredPayrolls = useMemo(() => {
    if (!payrolls) return [];
    return payrolls.filter((p: Payroll) => {
      let matches = true;
      if (filterValues.month) {
        matches =
          matches &&
          p.month
            .toLowerCase()
            .includes((filterValues.month as string).toLowerCase());
      }
      if (filterValues.status) {
        matches = matches && p.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, payrolls]);

  // Combine loading and error states
  const isLoading = payrollLoading;
  const isError = payrollError;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading data.</div>;

  // Status summary values based on full payrolls list
  const total = payrolls?.length ?? 0;
  const pendingCount =
    payrolls?.filter((p) => p.status === "Pending").length ?? 0;
  const paidCount = payrolls?.filter((p) => p.status === "Paid").length ?? 0;

  // Define download columns
  const columns: Column<Payroll>[] = [
    {
      header: "User",
      accessor: (row: Payroll) => row.user?.first_name || "-",
    },
    { header: "Salary", accessor: "salary" },
    { header: "Month", accessor: "month" },
    { header: "Status", accessor: "status" },
  ];

  // Filter options
  const statusOptions: Option<string>[] = [
    { label: "Pending", value: "Pending" },
    { label: "Paid", value: "Paid" },
  ];

  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "month",
      label: "Month",
      type: "text",
      placeholder: "Search by month…",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Pending", value: pendingCount },
          { label: "Paid", value: paidCount },
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
      <div className="flex justify-end space-x-4 mb-8">
        <div className="flex space-x-4">
          <button
            className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
        </div>
        <GenericDownloads
          data={filteredPayrolls}
          title="Payrolls_List"
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

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PayrollForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Payrolls</h1>

      <PayrollsTable
        filteredPayrolls={filteredPayrolls}
        selectedColumns={selectedColumns}
      />
    </div>
  );
};

export default PayrollsPage;
