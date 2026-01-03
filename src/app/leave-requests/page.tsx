"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Calendar, User, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";

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
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card p-8 sm:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
            <div className="rounded-[2.5rem] bg-primary/10 p-6 shadow-xl border border-primary/20">
              <Calendar className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tighter">
                Leave Protocol
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                <span className="w-12 h-px bg-primary/30" /> Personnel Time-Off Registry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-end">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl text-[10px] uppercase tracking-widest px-8 py-4 flex items-center gap-3 transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95">
              <Plus size={16} />
              <span>Initiate Request</span>
            </button>
          </div>
        </header>

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {requests.map((request) => (
            <div key={request.id} className="bg-card rounded-[3rem] border border-border p-8 flex flex-col transition-all hover:shadow-2xl hover:shadow-black/10 group hover:border-primary/20">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all shadow-inner">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{request.name}</h3>
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mt-1 slashed-zero">{request.type}</p>
                  </div>
                </div>
                <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${request.status === "Approved" ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-muted/10 p-6 rounded-2xl border border-border group-hover:bg-primary/[0.02] transition-colors">
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary/40" /> Start Vector
                  </p>
                  <p className="text-sm font-black text-foreground tracking-tight">{request.startDate}</p>
                </div>
                <div className="bg-muted/10 p-6 rounded-2xl border border-border group-hover:bg-primary/[0.02] transition-colors">
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-destructive/40" /> End Target
                  </p>
                  <p className="text-sm font-black text-foreground tracking-tight">{request.endDate}</p>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-4 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary/40" /> Operational Narrative
                </p>
                <div className="bg-muted/5 p-6 rounded-[2rem] border border-border italic font-medium">
                  <p className="text-sm text-muted-foreground leading-relaxed">"{request.reason}"</p>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground/20" />
                  <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-wider">Synced {request.appliedOn}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-4 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-primary/20 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <button className="p-4 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-destructive/20 shadow-sm">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="md:col-span-2 p-24 flex flex-col items-center justify-center text-center bg-muted/5 rounded-[4rem] border-4 border-dashed border-border group hover:border-primary/20 transition-all">
              <div className="w-24 h-24 bg-card rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-border group-hover:scale-110 transition-transform">
                <Calendar className="w-12 h-12 text-muted-foreground/20" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] mt-2">Zero Pending Protocols</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
