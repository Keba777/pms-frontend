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
  ArrowRight,
  Database,
  History,
  Lock,
  Activity,
  Terminal
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useOrganizations } from "@/hooks/useOrganizations";

const SettingsPage = () => {
  const settingsSections = [
    {
      title: "User Directory",
      description: "Manage staff identities, account statuses, and profile information.",
      icon: <Users className="w-6 h-6" />,
      href: "/users",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Organization Units",
      description: "Define departmental structures and functional hierarchies.",
      icon: <Building2 className="w-6 h-6" />,
      href: "/departments",
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      title: "Client Relations",
      description: "Maintain corporate partnerships and engagement portfolios.",
      icon: <Briefcase className="w-6 h-6" />,
      href: "/clients",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Site Infrastructure",
      description: "Configure physical operational locations and asset distribution.",
      icon: <MapPin className="w-6 h-6" />,
      href: "/sites",
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      title: "Security Policies",
      description: "Govern role-based access controls and resource permissions.",
      icon: <ShieldCheck className="w-6 h-6" />,
      href: "/settings/permission",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "Global Standards",
      description: "Set internationalization protocols and temporal synchronization.",
      icon: <Globe className="w-6 h-6" />,
      href: "/settings/languages",
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  const adminSettings = [
    {
      title: "Organization Hub",
      description: "Advanced management of enterprise entities and lifecycle status.",
      icon: <Building2 className="w-6 h-6" />,
      href: "/organizations",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      title: "Audit Chronicles",
      description: "Comprehensive registry of system-wide administrative operations.",
      icon: <History className="w-6 h-6" />,
      href: "/settings/audit-logs",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Infrastructure",
      description: "Real-time monitoring of database and cluster health metrics.",
      icon: <Database className="w-6 h-6" />,
      href: "/settings/infrastructure",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Security Vault",
      description: "Global authentication protocols and system-wide encryption.",
      icon: <Lock className="w-6 h-6" />,
      href: "/settings/security",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Telemetrics",
      description: "Application performance monitoring and resource utilization.",
      icon: <Activity className="w-6 h-6" />,
      href: "/settings/telemetrics",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Terminal Config",
      description: "Low-level system constants and developer maintenance mode.",
      icon: <Terminal className="w-6 h-6" />,
      href: "/settings/system-config",
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
  ];

  const { user } = useAuthStore();
  const isSystemAdmin = user?.role?.name?.toLowerCase() === "systemadmin";

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-12 bg-muted/30 p-6 sm:p-10 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight">
                Control Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted-foreground max-w-2xl leading-relaxed">
              Orchestrate your enterprise environment through centralized configuration modules. Manage personnel, sites, and security protocols from a single interface.
            </p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {settingsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-card p-6 rounded-4xl border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  {section.icon}
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {section.title}
                </h3>
                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed mb-8 grow">
                  {section.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                  Configure Module <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                {React.isValidElement(section.icon) && React.cloneElement(section.icon as React.ReactElement<any>, { className: "w-24 h-24" })}
              </div>
            </Link>
          ))}
        </div>

        {/* System Administration Section */}
        {isSystemAdmin && (
          <div className="mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-1 bg-cyan-600 rounded-full" />
              <h2 className="text-sm font-black text-cyan-600 uppercase tracking-[0.2em]">System Administration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminSettings.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group bg-white p-6 rounded-4xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-cyan-200 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      {section.icon}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2 group-hover:text-cyan-600 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-8 grow">
                      {section.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                      Access Console <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none">
                    {React.isValidElement(section.icon) && React.cloneElement(section.icon as React.ReactElement<any>, { className: "w-24 h-24" })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
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