"use client";

import React from 'react';
import Link from "next/link";
import { Languages, Calendar, Globe, AlertCircle, CheckCircle2 } from "lucide-react";

const LanguageSettings = () => {
  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
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
                    <span className="text-gray-900 uppercase tracking-tighter">Locality</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span>/</span>
                    <span className="text-gray-900 uppercase tracking-tighter">Regional</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
                Global Preferences
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                Configure internationalization standards and temporal synchronization
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Calendar className="w-24 h-24 text-cyan-700" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-700 mb-6 shadow-inner transition-colors group-hover:bg-cyan-100">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Temporal Standard</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-6">
                All date-time operations across the ecosystem are strictly standardized to the <span className="text-cyan-700 underline decoration-cyan-200 underline-offset-4">Gregorian Calendar</span> system for cross-regional compatibility.
              </p>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] font-bold text-gray-600 italic">
                <AlertCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                "Manual overrides are disabled to preserve database integrity."
              </div>
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group opacity-80grayscale-50">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Globe className="w-24 h-24 text-indigo-700" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 mb-6 shadow-inner transition-colors group-hover:bg-indigo-100">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Linguistic Layer</h3>
              <p className="text-xs font-bold text-gray-500 leading-relaxed mb-6">
                The primary system language is currently locked to <span className="text-indigo-700">English (Universal)</span>. Multilingual engine support is scheduled for Phase 4 deployment.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arabic</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 opacity-50 cursor-not-allowed">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">French</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-cyan-900 rounded-[2rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <Globe className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 mb-1">Ecosystem Note</p>
              <p className="text-sm font-bold opacity-90 leading-relaxed">
                System-wide localization affects timestamp generation, currency formatting templates, and linguistic tokens within the management interface. Change requests must be approved by the Global Admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;