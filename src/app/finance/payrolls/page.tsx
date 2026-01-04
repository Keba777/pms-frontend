"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, PlusIcon, DollarSign, Clock, CheckCircle2, Search, Filter, AlertCircle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

const columnOptions: Record<string, string> = {
  user: "User",
  net_pay: "Net Pay",
  pay_period: "Period",
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

  const filteredPayrolls = useMemo(() => {
    if (!payrolls) return [];
    return payrolls.filter((p: Payroll) => {
      let matches = true;
      if (filterValues.pay_period) {
        matches =
          matches &&
          p.pay_period
            .toLowerCase()
            .includes((filterValues.pay_period as string).toLowerCase());
      }
      if (filterValues.status) {
        matches = matches && p.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, payrolls]);

  // No early return for loading

  const total = payrolls?.length ?? 0;
  const pendingCount = payrolls?.filter((p) => p.status === "pending").length ?? 0;
  const paidCount = payrolls?.filter((p) => p.status === "paid").length ?? 0;

  const columns: Column<Payroll>[] = [
    { header: "User", accessor: (row: Payroll) => row.user?.first_name || "-" },
    { header: "Net Pay", accessor: "net_pay" },
    { header: "Period", accessor: "pay_period" },
    { header: "Status", accessor: "status" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "pay_period",
      label: "Period",
      type: "text",
      placeholder: "Search by period (YYYY-MM)…",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
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
                    <span className="text-foreground">Payrolls</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
                Staff Payrolls
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                Manage employee salaries, disbursements and payment cycles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <PlusIcon className="w-4 h-4" /> Process Payroll
              </button>
              <GenericDownloads
                data={filteredPayrolls}
                title="Payrolls_Summary"
                columns={columns}
              />
            </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Records", value: total, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            { label: "Unpaid / Pending", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Processed / Paid", value: paidCount, icon: CheckCircle2, color: "text-primary", bg: "bg-primary/20" },
          ].map((item) => (
            <div key={item.label} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-inner shrink-0`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-xl font-black text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
          </div>
        </div>

        {/* Payrolls Table Wrapper */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-1 min-h-[400px]">
          {payrollError ? (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-destructive/5 rounded-2xl">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-black text-destructive uppercase tracking-tight">Payroll Sync Error</h3>
              <p className="text-xs font-bold text-destructive mt-2 max-w-xs">{payrollError.message}</p>
            </div>
          ) : (
            <PayrollsTable
              filteredPayrolls={filteredPayrolls}
              selectedColumns={selectedColumns}
              isLoading={payrollLoading}
            />
          )}
        </div>
      </div>

      {/* Payroll Processing Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-300">
            <PayrollForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollsPage;
