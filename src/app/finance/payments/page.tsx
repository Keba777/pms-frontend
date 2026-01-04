"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, PlusIcon, CreditCard, Banknote, Smartphone, Wallet, Search, Filter, AlertCircle } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

const columnOptions: Record<string, string> = {
  project: "Project",
  amount_paid: "Amount",
  payment_date: "Date",
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

  // Layout remains static during loading

  const total = payments?.length ?? 0;
  const cashCount = payments?.filter((p) => p.method === "cash").length ?? 0;
  const bankTransferCount = payments?.filter((p) => p.method === "bank_transfer").length ?? 0;
  const checkCount = payments?.filter((p) => p.method === "check").length ?? 0;
  const mobileMoneyCount = payments?.filter((p) => p.method === "mobile_money").length ?? 0;

  const columns: Column<Payment>[] = [
    { header: "Project", accessor: (row) => row.invoice?.project?.title || "-" },
    { header: "Amount", accessor: "amount_paid" },
    { header: "Date", accessor: (row) => row.payment_date ? new Date(row.payment_date).toISOString().split("T")[0] : "-" },
    { header: "Method", accessor: (row) => row.method.replace('_', ' ') },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "method",
      label: "Method",
      type: "select",
      options: [
        { label: "Cash", value: "cash" },
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Check", value: "check" },
        { label: "Mobile Money", value: "mobile_money" },
      ],
    },
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
                    <span className="text-foreground">Payments</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
                Payment History
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                Monitor all financial transactions and payment methods
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <PlusIcon className="w-4 h-4" /> Log Payment
              </button>
              <GenericDownloads
                data={filteredPayments}
                title="Payments_Report"
                columns={columns}
              />
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Cash Flow", value: cashCount, icon: Banknote, color: "text-primary", bg: "bg-primary/10" },
            { label: "Bank Wire", value: bankTransferCount, icon: Wallet, color: "text-primary", bg: "bg-primary/20" },
            { label: "Checks", value: checkCount, icon: CreditCard, color: "text-destructive", bg: "bg-destructive/10" },
            { label: "Mobile Pay", value: mobileMoneyCount, icon: Smartphone, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <div key={item.label} className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-inner shrink-0`}>
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-lg sm:text-xl font-black text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-end gap-4 mb-6">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>

        {/* List Content */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-1 min-h-[400px]">
          {paymentError ? (
            <div className="p-12 flex flex-col items-center justify-center text-center bg-destructive/5 rounded-xl">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h3 className="text-lg font-black text-destructive uppercase tracking-tight">Financial Sync Failed</h3>
              <p className="text-xs font-bold text-destructive mt-2 max-w-xs">{paymentError.message}</p>
            </div>
          ) : (
            <PaymentsTable
              filteredPayments={filteredPayments}
              selectedColumns={selectedColumns}
              isLoading={paymentLoading}
            />
          )}
        </div>
      </div>

      {/* Payment Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-300">
            <PaymentForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
