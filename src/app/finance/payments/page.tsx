// PaymentsPage.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, PlusIcon } from "lucide-react";
import { usePayments } from "@/hooks/useFinancials";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Payment } from "@/types/financial";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import PaymentForm from "@/components/forms/finance/PaymentForm";
import PaymentsTable from "@/components/finance/PaymentsTable";

const columnOptions: Record<string, string> = {
  project: "Project",
  amount: "Amount",
  date: "Date",
  method: "Method",
  action: "Action",
};

const PaymentsPage = () => {
  const {
    data: payments,
    isLoading: paymentLoading,
    error: paymentError,
  } = usePayments();

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

  // Compute filteredPayments using useMemo, with a fallback for when payments is undefined
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter((p: Payment) => {
      let matches = true;
      if (filterValues.method) {
        matches = matches && p.method === filterValues.method;
      }
      return matches;
    });
  }, [filterValues, payments]);

  // Combine loading and error states
  const isLoading = paymentLoading;
  const isError = paymentError;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading data.</div>;

  // Summary values based on full payments list
  const total = payments?.length ?? 0;
  const cashCount = payments?.filter((p) => p.method === "Cash").length ?? 0;
  const bankTransferCount =
    payments?.filter((p) => p.method === "Bank Transfer").length ?? 0;
  const creditCardCount =
    payments?.filter((p) => p.method === "Credit Card").length ?? 0;
  const mobileMoneyCount =
    payments?.filter((p) => p.method === "Mobile Money").length ?? 0;

  // Define download columns
  const columns: Column<Payment>[] = [
    {
      header: "Project",
      accessor: (row: Payment) => row.project?.title || "-",
    },
    { header: "Amount", accessor: "amount" },
    {
      header: "Date",
      accessor: (row: Payment) =>
        row.date ? new Date(row.date).toISOString().split("T")[0] : "-",
    },
    { header: "Method", accessor: "method" },
  ];

  // Filter options
  const methodOptions: Option<string>[] = [
    { label: "Cash", value: "Cash" },
    { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Credit Card", value: "Credit Card" },
    { label: "Mobile Money", value: "Mobile Money" },
  ];

  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "method",
      label: "Method",
      type: "select",
      options: methodOptions,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Cash", value: cashCount },
          { label: "Bank Transfer", value: bankTransferCount },
          { label: "Credit Card", value: creditCardCount },
          { label: "Mobile Money", value: mobileMoneyCount },
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
          data={filteredPayments}
          title="Payments_List"
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
            <PaymentForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Payments</h1>

      <PaymentsTable
        filteredPayments={filteredPayments}
        selectedColumns={selectedColumns}
      />
    </div>
  );
};

export default PaymentsPage;
