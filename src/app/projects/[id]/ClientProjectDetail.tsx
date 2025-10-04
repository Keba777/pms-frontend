"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { getDateDuration } from "@/utils/helper";
import { Task } from "@/types/task";
import StatsCard from "@/components/dashboard/StatsCard";
import TaskTable from "@/components/master-schedule/TaskTable";
import TaskForm from "@/components/forms/TaskForm";
import DiscussionTab from "@/components/projects/DiscussionTab";
import IssueTab from "@/components/projects/IssueTab";
import FilesTab from "@/components/projects/FilesTab";
import NotificationTab from "@/components/projects/NotificationTab";
import ActivityLogTab from "@/components/projects/ActivityLogTab";
import ActualTaskTable from "@/components/master-schedule/ActualTaskTable";

// ✅ Use shadcn/ui Tabs
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ClientProjectDetailProps {
  projectId: string;
}

export default function ClientProjectDetail({
  projectId,
}: ClientProjectDetailProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="text-center text-red-500 mt-10">Project not found.</div>
    );
  }

  // Task stats helper
  const getCountByStatus = (tasks: Task[], status: string): number =>
    tasks.filter((task) => task.status === status).length;

  // Task statistics array
  const taskStats = [
    {
      label: "Not Started",
      value: getCountByStatus(project.tasks || [], "Not Started"),
      icon: <Plus size={18} />,
      iconColor: "#f87171",
      link: "/tasks",
    },
    {
      label: "Started",
      value: getCountByStatus(project.tasks || [], "Started"),
      icon: <Plus size={18} />,
      iconColor: "#facc15",
      link: "/tasks",
    },
    {
      label: "In Progress",
      value: getCountByStatus(project.tasks || [], "InProgress"),
      icon: <Plus size={18} />,
      iconColor: "#3b82f6",
      link: "/tasks",
    },
    {
      label: "On Hold",
      value: getCountByStatus(project.tasks || [], "Onhold"),
      icon: <Plus size={18} />,
      iconColor: "#f59e0b",
      link: "/tasks",
    },
    {
      label: "Canceled",
      value: getCountByStatus(project.tasks || [], "Canceled"),
      icon: <Plus size={18} />,
      iconColor: "#ef4444",
      link: "/tasks",
    },
    {
      label: "Completed",
      value: getCountByStatus(project.tasks || [], "Completed"),
      icon: <Plus size={18} />,
      iconColor: "#10b981",
      link: "/tasks",
    },
  ];

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
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-800 mb-2">
        {project.title}
      </h1>
      {project.description && (
        <p className="text-gray-600 mb-4">{project.description}</p>
      )}
      <div className="mb-6">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {project.status}
        </span>
      </div>

      {/* Stats + Details */}
      <div className="flex flex-col lg:flex-row lg:space-x-8 mb-8">
        <div className="lg:w-1/3 mb-6 lg:mb-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-800 mb-4">
            Task Statistics
          </h2>
          <StatsCard
            title="Task Statistics"
            items={taskStats}
            total={project.tasks?.length ?? 0}
          />
        </div>
        <div className="lg:w-2/3 bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              Priority: {project.priority}
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              Start: {new Date(project.start_date).toLocaleDateString()}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              End: {new Date(project.end_date).toLocaleDateString()}
            </span>
            {duration && (
              <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Duration: {duration}
              </span>
            )}
          </div>
        </div>
      </div>

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
          <DiscussionTab />
        </TabsContent>
        <TabsContent value="issue" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
          <IssueTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="files" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
          <FilesTab type="project" referenceId={projectId} />
        </TabsContent>
        <TabsContent value="notification" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
          <NotificationTab />
        </TabsContent>
        <TabsContent value="activityLog" className="p-4 sm:p-6 border rounded-lg shadow bg-white">
          <ActivityLogTab projectId={projectId} />
        </TabsContent>
      </Tabs>

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
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
            >
              <Plus className="inline-block mr-2 w-4 h-4" /> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
