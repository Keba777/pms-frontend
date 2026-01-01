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

  if (paymentLoading) {
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

  if (paymentError) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center bg-rose-50 rounded-3xl border border-rose-100">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">Financial Sync Failed</h3>
        <p className="text-xs font-bold text-rose-600 mt-2 max-w-xs">{paymentError.message}</p>
      </div>
    );
  }

  const total = payments?.length ?? 0;
  const cashCount = payments?.filter((p) => p.method === "Cash").length ?? 0;
  const bankTransferCount = payments?.filter((p) => p.method === "Bank Transfer").length ?? 0;
  const creditCardCount = payments?.filter((p) => p.method === "Credit Card").length ?? 0;
  const mobileMoneyCount = payments?.filter((p) => p.method === "Mobile Money").length ?? 0;

  const columns: Column<Payment>[] = [
    { header: "Project", accessor: (row) => row.project?.title || "-" },
    { header: "Amount", accessor: "amount" },
    { header: "Date", accessor: (row) => row.date ? new Date(row.date).toISOString().split("T")[0] : "-" },
    { header: "Method", accessor: "method" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "method",
      label: "Method",
      type: "select",
      options: [
        { label: "Cash", value: "Cash" },
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Credit Card", value: "Credit Card" },
        { label: "Mobile Money", value: "Mobile Money" },
      ],
    },
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
                    <span className="text-gray-900">Payments</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
                Payment History
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                Monitor all financial transactions and payment methods
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-6 h-12 bg-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-100 active:scale-95"
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
            { label: "Cash Flow", value: cashCount, icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Bank Wire", value: bankTransferCount, icon: Wallet, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Cards", value: creditCardCount, icon: CreditCard, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Mobile Pay", value: mobileMoneyCount, icon: Smartphone, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-inner shrink-0`}>
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                <p className="text-lg sm:text-xl font-black text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div ref={menuRef} className="relative w-full lg:w-auto">
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="w-full lg:w-auto flex items-center justify-between lg:justify-start gap-3 px-5 h-11 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-800 hover:bg-gray-50 transition-colors shadow-sm focus:ring-4 focus:ring-cyan-500/5 outline-none"
            >
              <span className="flex items-center gap-2">Customize Columns</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showColumnMenu ? "rotate-180" : ""}`} />
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-full lg:w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 mb-2 border-b border-gray-50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Visibility</p>
                </div>
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 px-4 py-3 hover:bg-cyan-50 rounded-xl cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key)}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 rounded border-gray-300 text-cyan-700 focus:ring-cyan-500"
                    />
                    <span className="text-xs font-bold text-gray-600 group-hover:text-cyan-800">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4">
            <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-1">
          <PaymentsTable filteredPayments={filteredPayments} selectedColumns={selectedColumns} />
        </div>
      </div>

      {/* Payment Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-300">
            <PaymentForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
