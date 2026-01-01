"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Calendar, User, Clock, CheckCircle2, XCircle } from "lucide-react";

const LeaveRequestsPage = () => {
  const [requests] = useState([
    {
      id: 1,
      name: "John Doe",
      type: "Sick Leave",
      startDate: "2025-06-01",
      endDate: "2025-06-03",
      duration: "3 days",
      reason: "Medical appointment and recovery",
      status: "Approved",
      appliedOn: "2025-05-20"
    },
    {
      id: 2,
      name: "Jane Smith",
      type: "Annual Leave",
      startDate: "2025-07-10",
      endDate: "2025-07-15",
      duration: "5 days",
      reason: "Family vacation",
      status: "Pending",
      appliedOn: "2025-05-22"
    }
  ]);

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <nav className="mb-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900">Leave Requests</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
                Leave Management
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                Manage employee time-off requests and approvals
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 h-12 bg-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-800 transition-all shadow-lg shadow-cyan-100 active:scale-95">
              New Request
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col transition-all hover:shadow-xl hover:shadow-cyan-100/30 group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-cyan-700 border border-gray-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{request.name}</h3>
                    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mt-0.5">{request.type}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${request.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-cyan-600" /> Start Date
                  </p>
                  <p className="text-xs font-black text-gray-900">{request.startDate}</p>
                </div>
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-rose-500" /> End Date
                  </p>
                  <p className="text-xs font-black text-gray-900">{request.endDate}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-cyan-600" /> Reason
                </p>
                <p className="text-xs font-bold text-gray-500 leading-relaxed italic">"{request.reason}"</p>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Applied on {request.appliedOn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="md:col-span-2 p-20 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <Calendar className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No pending requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
