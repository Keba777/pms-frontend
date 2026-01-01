"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, PlusIcon, Wallet, PiggyBank, Receipt, TrendingUp, AlertCircle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

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

  const [, setFilterValues] = useState<FilterValues>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBudgets = useMemo(() => {
    if (!budgets) return [];
    return budgets;
  }, [budgets]);

  if (budgetLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (budgetError) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center bg-rose-50 rounded-3xl border border-rose-100">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">Allocation Error</h3>
        <p className="text-xs font-bold text-rose-600 mt-2 max-w-xs">{budgetError.message}</p>
      </div>
    );
  }

  // Financial aggregates
  const totalCount = budgets?.length ?? 0;
  const totalAllocation = budgets?.reduce((acc, b) => acc + (Number(b.allocated) || 0), 0) ?? 0;
  const totalSpent = budgets?.reduce((acc, b) => acc + (Number(b.spent) || 0), 0) ?? 0;
  const totalRemaining = budgets?.reduce((acc, b) => acc + (Number(b.remaining) || 0), 0) ?? 0;

  const columns: Column<Budget>[] = [
    { header: "Project", accessor: (row) => row.project?.title || "-" },
    { header: "Total", accessor: "total" },
    { header: "Allocated", accessor: "allocated" },
    { header: "Spent", accessor: "spent" },
    { header: "Remaining", accessor: "remaining" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <nav className="mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900">Finance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900">Budgets</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
                Project Budgeting
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                Allocate funds and track expenditure across all active projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-6 h-12 bg-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-100 active:scale-95"
              >
                <PlusIcon className="w-4 h-4" /> New Budget
              </button>
              <GenericDownloads
                data={filteredBudgets}
                title="Budgets_Analysis"
                columns={columns}
              />
            </div>
          </div>
        </div>

        {/* Global Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Budgets", value: totalCount, icon: Receipt, color: "text-cyan-600", bg: "bg-cyan-50", suffix: "" },
            { label: "Total Allocated", value: totalAllocation.toLocaleString(), icon: PiggyBank, color: "text-indigo-600", bg: "bg-indigo-50", suffix: " $" },
            { label: "Total Spent", value: totalSpent.toLocaleString(), icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50", suffix: " $" },
            { label: "Net Remaining", value: totalRemaining.toLocaleString(), icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50", suffix: " $" },
          ].map((item) => (
            <div key={item.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-inner`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-lg font-black text-gray-900">{item.value}{item.suffix}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div ref={menuRef} className="relative w-full lg:w-auto">
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3 px-5 h-11 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-800 hover:bg-gray-50 transition-colors shadow-sm focus:ring-4 focus:ring-cyan-500/5 outline-none"
            >
              <span className="flex items-center gap-2">Configure Columns</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showColumnMenu ? "rotate-180" : ""}`} />
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-full lg:w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 mb-1 border-b border-gray-50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Visibility Settings</p>
                </div>
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 rounded-xl cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key)}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 rounded border-gray-300 text-cyan-700 focus:ring-cyan-500 shadow-sm"
                    />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-cyan-800">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <GenericFilter fields={[]} onFilterChange={setFilterValues} />
          </div>
        </div>

        {/* Budgets Grid/Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-1">
          <BudgetsTable filteredBudgets={filteredBudgets} selectedColumns={selectedColumns} />
        </div>
      </div>

      {/* Budget Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-300">
            <BudgetForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
