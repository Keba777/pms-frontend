
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
    <div className="max-w-5xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 text-cyan-700 hover:text-cyan-800"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to KPIs
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded-t-xl">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              KPI Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-cyan-700" />
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="font-semibold">{new Date(kpi?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-cyan-700" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-xl">{kpi.type}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
                  <p className="text-5xl font-bold text-cyan-700">{kpi.score}</p>
                  <p className="text-lg text-gray-700 mt-2">Score</p>
                </div>
                <Badge className={`text-lg px-6 py-2 ${statusColor}`}>
                  {kpi.status}
                </Badge>
              </div>
            </div>

            {kpi.remark && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-cyan-700 mt-1" />
                  <div>
                    <p className="font-medium text-gray-700">Remark</p>
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">{kpi.remark}</p>
                  </div>
                </div>
              </div>
            )}

            {kpi.target && (
              <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-xl">
                <Target className="w-10 h-10 text-emerald-700" />
                <div>
                  <p className="font-medium text-gray-700">Target</p>
                  <p className="text-3xl font-bold text-emerald-700">{kpi.target}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Entity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {kpi.userLabor && <User className="w-6 h-6" />}
              {kpi.laborInformation && <Building className="w-6 h-6" />}
              {kpi.equipment && <Wrench className="w-6 h-6" />}
              Related To
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpi.userLabor && <ProfileAvatar user={kpi.userLabor} />}
            {kpi.laborInformation && (
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 border-2 border-dashed rounded-full mx-auto mb-4" />
                <p className="font-semibold text-lg">
                  {kpi.laborInformation.firstName} {kpi.laborInformation.lastName}
                </p>
              </div>
            )}
            {kpi.equipment && (
              <div className="text-center">
                <Wrench className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="font-semibold text-lg">{kpi.equipment.item}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiDetailPage;
