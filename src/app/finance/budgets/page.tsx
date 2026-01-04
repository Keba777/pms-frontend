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
  allocated_amount: "Allocated",
  spent_amount: "Spent",
  remaining_amount: "Remaining",
  status: "Status", // Added status
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

  // Financial aggregates
  const totalCount = budgets?.length ?? 0;
  const totalAllocation = budgets?.reduce((acc, b) => acc + (Number(b.allocated_amount) || 0), 0) ?? 0; // Fix field name
  const totalSpent = budgets?.reduce((acc, b) => acc + (Number(b.spent_amount) || 0), 0) ?? 0; // Fix field name
  const totalRemaining = budgets?.reduce((acc, b) => acc + (Number(b.remaining_amount) || 0), 0) ?? 0; // Fix field name

  const columns: Column<Budget>[] = [
    { header: "Project", accessor: (row) => row.project?.title || "-" },
    { header: "Allocated", accessor: "allocated_amount" },
    { header: "Spent", accessor: "spent_amount" },
    { header: "Remaining", accessor: "remaining_amount" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-muted/30 p-4 sm:p-6 rounded-xl border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <nav className="mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-foreground">Finance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-foreground">Budgets</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
                Project Budgeting
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                Allocate funds and track expenditure across all active projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
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
            { label: "Active Budgets", value: totalCount, icon: Receipt, color: "text-primary", bg: "bg-primary/10", suffix: "" },
            { label: "Total Allocated", value: totalAllocation.toLocaleString(), icon: PiggyBank, color: "text-primary", bg: "bg-primary/20", suffix: " $" },
            { label: "Total Spent", value: totalSpent.toLocaleString(), icon: TrendingUp, color: "text-destructive", bg: "bg-destructive/10", suffix: " $" },
            { label: "Net Remaining", value: totalRemaining.toLocaleString(), icon: Wallet, color: "text-primary", bg: "bg-primary/10", suffix: " $" },
          ].map((item) => (
            <div key={item.label} className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-inner`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-lg font-black text-foreground">{item.value}{item.suffix}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 mb-6">
          <GenericFilter fields={[]} onFilterChange={setFilterValues} />
        </div>

        {/* Budgets Grid/Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-1 min-h-[400px]">
          {budgetError ? (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-destructive/5 rounded-xl">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-black text-destructive uppercase tracking-tight">Allocation Error</h3>
              <p className="text-xs font-bold text-destructive mt-2 max-w-xs">{budgetError.message}</p>
            </div>
          ) : (
            <BudgetsTable
              filteredBudgets={filteredBudgets}
              selectedColumns={selectedColumns}
              isLoading={budgetLoading}
            />
          )}
        </div>
      </div>

      {/* Budget Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-300">
            <BudgetForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
