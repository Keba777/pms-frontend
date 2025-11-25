// app/issues/[id]/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, AlertCircle, Building, Users, CheckCircle, Clipboard, Hash, MessageSquare, Clock } from "lucide-react";
import { useIssue } from "@/hooks/useIssues"; // Assuming a hook to fetch single issue by ID
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";

const IssueDetailsPage = () => {
  const { useEthiopianDate } = useSettingsStore();
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: issue, isLoading, error } = useIssue(id);
  const { data: sites } = useSites();
  const { data: departments } = useDepartments();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-4" /> {/* Back button skeleton */}
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-cyan-700 text-white">
            <Skeleton className="h-8 w-64" /> {/* Title skeleton */}
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !issue) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading issue details.</div>;
  }

  const site = sites?.find((s) => s.id === issue.siteId);
  const department = departments?.find((d) => d.id === issue.departmentId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4 text-cyan-700 hover:text-cyan-800 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Issues
      </Button>

      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardHeader className="bg-cyan-700 text-white py-4">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Issue Details - {issue.issueType}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* ID and References */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Hash className="h-5 w-5 text-cyan-700" />
              Identification
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><span className="font-medium">Activity ID:</span> {issue.activity?.activity_name || "N/A"}</p>
              <p className="flex items-center gap-1"><span className="font-medium">Project ID:</span> {issue.project?.title || "N/A"}</p>
              <p className="flex items-center gap-1"><span className="font-medium">Task ID:</span> {issue.task?.task_name || "N/A"}</p>
            </div>
          </section>

          {/* Issue Info */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-cyan-700" />
              Issue Information
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Calendar className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Date:</span> {format(issue.date, useEthiopianDate)}</p>
              <p className="flex items-center gap-1"><AlertCircle className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Type:</span> {issue.issueType}</p>
              <Badge className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                {issue.priority}
              </Badge>
              <Badge className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                {issue.status}
              </Badge>
            </div>
          </section>

          {/* People Involved */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-700" />
              People Involved
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><User className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Raised By:</span> {issue.raisedBy.first_name} {issue.raisedBy.last_name}</p>
              <p className="flex items-center gap-1"><User className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Responsible:</span> {issue.responsible?.first_name || "N/A"} {issue.responsible?.last_name || ""}</p>
            </div>
          </section>

          {/* Locations */}
          <section className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Building className="h-5 w-5 text-cyan-700" />
              Locations
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Building className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Site:</span> {site?.name || "N/A"}</p>
              <p className="flex items-center gap-1"><Building className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Department:</span> {department?.name || "N/A"}</p>
            </div>
          </section>

          {/* Description */}
          <section className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-700" />
              Description
            </h3>
            <p className="text-xs sm:text-sm bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap">{issue.description || "No description provided."}</p>
          </section>

          {/* Action Taken */}
          <section className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-cyan-700" />
              Action Taken
            </h3>
            <p className="text-xs sm:text-sm bg-gray-100 p-4 rounded-md text-gray-700 whitespace-pre-wrap">{issue.actionTaken || "No action taken yet."}</p>
          </section>

          {/* Timestamps */}
          <section className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-700" />
              Timestamps
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Created At:</span> {format(issue.createdAt, useEthiopianDate)}</p>
              <p className="flex items-center gap-1"><Clock className="h-4 w-4 text-cyan-700" /><span className="font-medium ml-1">Updated At:</span> {format(issue.updatedAt, useEthiopianDate)}</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetailsPage;