"use client";

import React from 'react';
import Link from "next/link";
import {
  Settings,
  Users,
  Building2,
  Briefcase,
  MapPin,
  ShieldCheck,
  Globe,
  ChevronRight,
  ArrowRight
} from "lucide-react";

const SettingsPage = () => {
  const settingsSections = [
    {
      title: "User Directory",
      description: "Manage staff identities, account statuses, and profile information.",
      icon: <Users className="w-6 h-6" />,
      href: "/users",
      color: "text-cyan-700",
      bg: "bg-cyan-50",
    },
    {
      title: "Organization Units",
      description: "Define departmental structures and functional hierarchies.",
      icon: <Building2 className="w-6 h-6" />,
      href: "/departments",
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      title: "Client Relations",
      description: "Maintain corporate partnerships and engagement portfolios.",
      icon: <Briefcase className="w-6 h-6" />,
      href: "/clients",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      title: "Site Infrastructure",
      description: "Configure physical operational locations and asset distribution.",
      icon: <MapPin className="w-6 h-6" />,
      href: "/sites",
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      title: "Security Policies",
      description: "Govern role-based access controls and resource permissions.",
      icon: <ShieldCheck className="w-6 h-6" />,
      href: "/settings/permission",
      color: "text-rose-700",
      bg: "bg-rose-50",
    },
    {
      title: "Global Standards",
      description: "Set internationalization protocols and temporal synchronization.",
      icon: <Globe className="w-6 h-6" />,
      href: "/settings/languages",
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-12 bg-gray-50 p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/50 rounded-full -mr-48 -mt-48 blur-3xl opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white flex items-center justify-center shadow-lg shadow-cyan-200">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-cyan-800 uppercase tracking-tight">
                Control Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 max-w-2xl leading-relaxed">
              Orchestrate your enterprise environment through centralized configuration modules. Manage personnel, sites, and security protocols from a single interface.
            </p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-cyan-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  {section.icon}
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2 group-hover:text-cyan-700 transition-colors">
                  {section.title}
                </h3>
                <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-8 flex-grow">
                  {section.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-700 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  Configure Module <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(section.icon, { className: "w-24 h-24" })}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
            Authorized Personal Only • Enterprise Edition v2.4
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;