"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { formatDate, getDateDuration } from "@/utils/dateUtils";
import { Task } from "@/types/task";
import TaskTable from "@/components/master-schedule/TaskTable";
import TaskForm from "@/components/forms/TaskForm";
import DiscussionTab from "@/components/projects/DiscussionTab";
import IssueTab from "@/components/projects/IssueTab";
import FilesTab from "@/components/projects/FilesTab";
import NotificationTab from "@/components/projects/NotificationTab";
import ActivityLogTab from "@/components/projects/ActivityLogTab";
import ActualTaskTable from "@/components/master-schedule/ActualTaskTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [showCreateForm, setShowCreateForm] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="text-center text-red-500 mt-10">Project not found.</div>
    );
  }

  // Calculate totals
  const totalTasks = project.tasks?.length ?? 0;
  const totalActivities = project.tasks?.reduce((sum, task) => sum + (task.activities?.length ?? 0), 0) ?? 0;

  const duration =
    project.start_date && project.end_date
      ? getDateDuration(project.start_date, project.end_date)
      : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white shadow-lg rounded-lg">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm sm:text-base font-semibold">
            Back to Projects
          </span>
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">
        {project.title}
      </h1>
      <div className="mb-6">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {project.status}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Statistics Section */}
        <div className="lg:w-1/4 grid grid-cols-1 gap-4">
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 shadow-sm">
            <h3 className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Total Tasks</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{totalTasks}</span>
              <span className="text-primary/70 text-sm">tasks defined</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 shadow-sm">
            <h3 className="text-emerald-800 text-sm font-semibold uppercase tracking-wider mb-2">Total Activities</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-emerald-900">{totalActivities}</span>
              <span className="text-emerald-600 text-sm">active works</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:flex-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Project Overview</h2>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-primary">{project.progress || 0}%</span>
            </div>
          </div>

          {project.description && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg border-l-4 border-primary shadow-sm">
              <p className="text-secondary text-sm leading-relaxed italic">
                {project.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Timeline</p>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Start: {formatDate(project.start_date)}
                  </span>
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    End: {formatDate(project.end_date)}
                  </span>
                  {duration && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">
                      Duration: {duration}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Financials & Priority</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(project.budget || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${project.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      project.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        project.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Entity Information</p>
                <div className="flex flex-col gap-1">
                  <div className="text-sm">
                    <span className="text-gray-500">Client: </span>
                    <span className="font-medium text-gray-800">{project.clientInfo?.companyName || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Site: </span>
                    <span className="font-medium text-gray-800">
                      {project.projectSite?.name || project.site?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {project.actuals && (
            <div className="mt-6 pt-6 border-t border-gray-50">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Project Actuals</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.actuals.start_date && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Actual Start</p>
                    <p className="text-xs font-semibold">{formatDate(project.actuals.start_date)}</p>
                  </div>
                )}
                {project.actuals.end_date && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Actual End</p>
                    <p className="text-xs font-semibold">{formatDate(project.actuals.end_date)}</p>
                  </div>
                )}
                {project.actuals.budget && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Actual Spend</p>
                    <p className="text-xs font-semibold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(project.actuals.budget))}
                    </p>
                  </div>
                )}
                {project.actuals.status && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Current Stage</p>
                    <p className="text-xs font-semibold">{project.actuals.status}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t pt-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h3>
        {project.attachments && project.attachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {project.attachments.map((url, index) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
              const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
              const isPDF = /\.pdf$/i.test(url);
              const fileName = url.split("/").pop();

              return (
                <div
                  key={index}
                  className="border rounded-lg p-2 bg-gray-50 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  {isImage ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-32 flex items-center justify-center bg-gray-200 rounded overflow-hidden mb-2"
                    >
                      <img
                        src={url}
                        alt={fileName}
                        className="object-cover w-full h-full"
                      />
                    </a>
                  ) : isVideo ? (
                    <div className="w-full h-32 bg-black rounded mb-2 flex items-center justify-center overflow-hidden">
                      <video src={url} controls className="w-full h-full" />
                    </div>
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-32 flex items-center justify-center bg-gray-200 rounded mb-2 hover:bg-gray-300 transition-colors"
                    >
                      <span className="text-4xl opacity-70">
                        {isPDF ? "📄" : "📎"}
                      </span>
                    </a>
                  )}

                  <div className="w-full text-center px-1">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-primary/80 hover:underline block truncate"
                      title={fileName}
                    >
                      {fileName}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No attachments.</p>
        )}
      </div>

      <div className="mt-8">
        {/* Project Tabs (shadcn/ui) */}
        <Tabs defaultValue="discussion" className="w-full">
          <TabsList className="flex flex-wrap justify-start gap-2 rounded-lg bg-muted p-2 shadow-sm">
            {[
              { key: "discussion", label: "Discussion" },
              { key: "issue", label: "Issue" },
              { key: "files", label: "Files" },
              { key: "notification", label: "Notification" },
              { key: "activityLog", label: "Activity Log" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="px-4 py-2 text-sm sm:text-base font-medium rounded-md 
                           data-[state=active]:bg-primary data-[state=active]:text-white
                           transition hover:bg-primary/10 hover:text-primary"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="discussion" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
            <DiscussionTab type="project" referenceId={projectId} />
          </TabsContent>
          <TabsContent value="issue" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
            <IssueTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="files" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
            <FilesTab type="project" referenceId={projectId} />
          </TabsContent>
          <TabsContent value="notification" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
            <NotificationTab type="project" referenceId={projectId} />
          </TabsContent>
          <TabsContent value="activityLog" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
            <ActivityLogTab type="project" referenceId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Tabs (shadcn/ui) */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-4">Tasks</h2>
        {project.tasks && project.tasks.length > 0 ? (
          <Tabs defaultValue="planned" className="w-full">
            <TabsList className="flex gap-2 rounded-lg bg-muted p-2 shadow-sm">
              <TabsTrigger
                value="planned"
                className="px-5 py-2 text-sm font-medium rounded-md 
                           data-[state=active]:bg-emerald-600 data-[state=active]:text-white
                           transition hover:bg-emerald-50"
              >
                Planned
              </TabsTrigger>
              <TabsTrigger
                value="actual"
                className="px-5 py-2 text-sm font-medium rounded-md 
                           data-[state=active]:bg-emerald-600 data-[state=active]:text-white
                           transition hover:bg-emerald-50"
              >
                Actual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="planned" className="mt-4">
              <TaskTable
                projectTitle={project.title}
                tasks={project.tasks}
                projectId={projectId}
              />
            </TabsContent>
            <TabsContent value="actual" className="mt-4">
              <ActualTaskTable tasks={project.tasks || []} projectId={project.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
            >
              <Plus className="inline-block mr-2 w-4 h-4" /> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-max-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              onClose={() => setShowCreateForm(false)}
              defaultProjectId={projectId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
