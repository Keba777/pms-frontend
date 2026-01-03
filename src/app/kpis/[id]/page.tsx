
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trophy, Target, MessageSquare, Calendar, User, Wrench, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useKpi } from "@/hooks/useKpis";
import ProfileAvatar from "@/components/common/ProfileAvatar";

const KpiDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: kpi, isLoading, error } = useKpi(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="grid gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !kpi) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-xl">KPI not found.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const statusColor = {
    Excellent: "bg-green-100 text-green-800",
    "V.Good": "bg-blue-100 text-blue-800",
    Good: "bg-yellow-100 text-yellow-800",
    Bad: "bg-red-100 text-red-800",
  }[kpi.status];

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 text-gray-400 hover:text-primary/90 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-primary/90 uppercase tracking-tight">
              KPI Details
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-cyan-600" />
              Created: {new Date(kpi?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
            {kpi.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">KPI Type</p>
                    <p className="text-xl font-black text-gray-800 tracking-tight">{kpi.type}</p>
                  </div>
                </div>
                {kpi.target && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Goal / Target</p>
                      <p className="text-xl font-black text-emerald-700 tracking-tight">{kpi.target}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-2xl border border-cyan-100 shadow-inner min-w-[140px]">
                <span className="text-5xl font-black text-primary/90 mb-1">{kpi.score}</span>
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em]">Overall Score</span>
              </div>
            </div>

            {kpi.remark && (
              <div className="mt-8 pt-8 border-t border-gray-50">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                  Performance Remarks
                </h4>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                    "{kpi.remark}"
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" />
                Linked Entity
              </h2>
            </div>
            <div className="p-8 flex flex-col items-center text-center">
              {kpi.userLabor && (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <ProfileAvatar user={kpi.userLabor} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned User</p>
                    <p className="text-sm font-bold text-gray-800">{kpi.userLabor.first_name} {kpi.userLabor.last_name}</p>
                  </div>
                </div>
              )}
              {kpi.laborInformation && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                    <Building className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Labor Resource</p>
                    <p className="text-sm font-bold text-gray-800">{kpi.laborInformation.firstName} {kpi.laborInformation.lastName}</p>
                  </div>
                </div>
              )}
              {kpi.equipment && (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center mx-auto shadow-inner">
                    <Wrench className="w-10 h-10 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Equipment Unit</p>
                    <p className="text-sm font-bold text-gray-800">{kpi.equipment.item}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="p-6 bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-cyan-200">
            <Trophy className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">KPI Summary</h3>
            <p className="text-xs text-white/80 leading-relaxed mb-6">
              This key performance indicator reflects the current operational efficiency and quality standards for the linked resource.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Record Status: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiDetailPage;
