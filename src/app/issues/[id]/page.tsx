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

const IssueDetailsPage = () => {
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
        <Card className="shadow-lg border-border">
          <CardHeader className="bg-primary text-primary-foreground">
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
    return <div className="flex justify-center items-center h-screen text-destructive">Error loading issue details.</div>;
  }

  const site = sites?.find((s) => s.id === issue.siteId);
  const department = departments?.find((d) => d.id === issue.departmentId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-destructive/10 text-destructive";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-muted text-muted-foreground";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-primary/10 text-primary";
      case "Closed": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <Button
        variant="ghost"
        className="mb-6 text-primary hover:text-primary/90 flex items-center gap-2 font-bold px-0 bg-transparent hover:bg-transparent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-5 w-5" /> Back to Issues
      </Button>

      <Card className="shadow-2xl border-none overflow-hidden rounded-2xl bg-background">
        <CardHeader className="bg-primary text-primary-foreground p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-black flex items-center gap-3">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10" />
              {issue.issueType}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getPriorityColor(issue.priority)} shadow-md`}>
                {issue.priority} Priority
              </Badge>
              <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(issue.status)} shadow-md`}>
                {issue.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Identification */}
            <section className="bg-muted/30 rounded-2xl p-5 border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Hash className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black uppercase text-muted-foreground tracking-wider">Identification</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Activity</span>
                  <span className="text-foreground font-black">{issue.activity?.activity_name || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Project</span>
                  <span className="text-foreground font-black">{issue.project?.title || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Task</span>
                  <span className="text-foreground font-black">{issue.task?.task_name || "N/A"}</span>
                </div>
              </div>
            </section>

            {/* People Involved */}
            <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black uppercase text-muted-foreground tracking-wider">Stakeholders</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Raised By</span>
                  <span className="text-gray-900 font-black flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    {issue.raisedBy.first_name} {issue.raisedBy.last_name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Responsible</span>
                  <span className="text-gray-900 font-black flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    {issue.responsible?.first_name || "N/A"} {issue.responsible?.last_name || ""}
                  </span>
                </div>
              </div>
            </section>

            {/* Context & Timeline */}
            <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black uppercase text-muted-foreground tracking-wider">Context</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Site</span>
                  <span className="text-foreground font-black">{site?.name || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Department</span>
                  <span className="text-foreground font-black">{department?.name || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">Incident Date</span>
                  <span className="text-foreground font-black flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(issue.date)}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Description */}
          <section className="bg-background rounded-2xl p-6 border-2 border-border shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-black uppercase text-foreground tracking-wider">Detailed Description</h3>
            </div>
            <div className="text-sm sm:text-base text-foreground leading-relaxed font-medium bg-muted/30 p-6 rounded-xl border border-border whitespace-pre-wrap">
              {issue.description || "No description provided."}
            </div>
          </section>

          {/* Action Taken */}
          <section className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-black uppercase text-foreground tracking-wider">Action Taken</h3>
            </div>
            <div className="text-sm sm:text-base text-primary leading-relaxed font-black bg-background/80 p-6 rounded-xl border border-primary/20 shadow-sm whitespace-pre-wrap">
              {issue.actionTaken || "No actions recorded yet."}
            </div>
          </section>

          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col sm:flex-row sm:gap-6">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  CREATED: <span className="text-foreground ml-1">{format(issue.createdAt)}</span>
                </p>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                  UPDATED: <span className="text-foreground ml-1">{format(issue.updatedAt)}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetailsPage;