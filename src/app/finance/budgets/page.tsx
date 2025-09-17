// BudgetsPage.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, PlusIcon } from "lucide-react";
import { useBudgets } from "@/hooks/useFinancials";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Budget } from "@/types/financial";
import {
  FilterField,
  FilterValues,
  GenericFilter,
} from "@/components/common/GenericFilter";
import BudgetForm from "@/components/forms/finance/BudgetForm";
import BudgetsTable from "@/components/finance/BudgetsTable";

const columnOptions: Record<string, string> = {
  project: "Project",
  total: "Total",
  allocated: "Allocated",
  spent: "Spent",
  remaining: "Remaining",
  action: "Action",
};

const BudgetsPage = () => {
  const { data: budgets, isLoading: budgetLoading, error: budgetError } = useBudgets();

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

  // Compute filteredBudgets using useMemo, with a fallback for when budgets is undefined
  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];
    return budgets.filter(() => {
      const matches = true;
      // No text or select filters since all fields are numbers
      return matches;
    });
  }, [filterValues, budgets]);

  // Combine loading and error states
  const isLoading = budgetLoading;
  const isError = budgetError;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading data.</div>;

  // Summary values based on full budgets list
  const total = budgets?.length ?? 0;

  // Define download columns
  const columns: Column<Budget>[] = [
    {
      header: "Project",
      accessor: (row: Budget) => row.project?.title || "-",
    },
    { header: "Total", accessor: "total" },
    { header: "Allocated", accessor: "allocated" },
    { header: "Spent", accessor: "spent" },
    { header: "Remaining", accessor: "remaining" },
  ];

  // Filter fields - none since no suitable fields for filtering
  const filterFields: FilterField<string>[] = [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
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
          data={filteredBudgets}
          title="Budgets_List"
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
            <BudgetForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Budgets</h1>

      <BudgetsTable
        filteredBudgets={filteredBudgets}
        selectedColumns={selectedColumns}
      />
    </div>
  );
};

export default BudgetsPage;
