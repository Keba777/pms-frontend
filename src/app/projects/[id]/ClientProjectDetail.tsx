"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { ArrowLeft, Plus, User } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import TaskTable from "@/components/master-schedule/TaskTable";
import TaskForm from "@/components/forms/TaskForm";
import { usePermissionsStore } from "@/store/permissionsStore";
import { toast } from "react-toastify";
import DiscussionTab from "@/components/projects/DiscussionTab";
import IssueTab from "@/components/projects/IssueTab";
import FilesTab from "@/components/projects/FilesTab";
import NotificationTab from "@/components/projects/NotificationTab";
import ActivityLogTab from "@/components/projects/ActivityLogTab";
import { getDateDuration } from "@/utils/helper";
import { Task } from "@/types/task";

interface ClientProjectDetailProps {
  projectId: string;
}

export default function ClientProjectDetail({
  projectId,
}: ClientProjectDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("discussion");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const project = projects.find((p) => p.id === projectId);
  const hasPermission = usePermissionsStore((state) => state.hasPermission);
  const canCreate = hasPermission("create tasks");

  const tabs = [
    { key: "discussion", label: "Discussion", component: <DiscussionTab /> },
    {
      key: "issue",
      label: "Issue",
      component: <IssueTab projectId={projectId} />,
    },
    { key: "files", label: "Files", component: <FilesTab /> },
    {
      key: "notification",
      label: "Notification",
      component: <NotificationTab />,
    },
    {
      key: "activityLog",
      label: "Activity Log",
      component: <ActivityLogTab projectId={projectId} />,
    },
  ];

  if (!project) {
    return (
      <div className="text-center text-red-500 mt-10">Project not found.</div>
    );
  }

  // Task stats helper
  const getCountByStatus = (tasks: Task[], status: string): number => {
    return tasks.filter((task) => task.status === status).length;
  };

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

  // Compute project duration
  const duration =
    project.start_date && project.end_date
      ? getDateDuration(project.start_date, project.end_date)
      : null;

  // Map member IDs to "Name (Role)"
  const memberDetails =
    project.members?.map((member) => ({
      name: `${member.first_name} ${member.last_name}`,
      role: member.role?.name || "No Role",
    })) ?? [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white shadow-lg rounded-lg">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <button
          className="flex items-center px-3 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm sm:text-base font-semibold">
            Back to Projects
          </span>
        </button>
      </div>

      {/* Project Title and Description */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-800 mb-4">
        {project.title}
      </h1>
      {project.description && (
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          {project.description}
        </p>
      )}
      <div className="mb-6">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {project.status}
        </span>
      </div>

      {/* Project Details and Stats */}
      <div className="flex flex-col lg:flex-row lg:space-x-8 mb-6">
        {/* Stats Card */}
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

        {/* Project Details */}
        <div className="lg:w-2/3 bg-gray-50 p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
            Project Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className="bg-yellow-300 text-yellow-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Priority: {project.priority}
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Start Date: {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                End Date: {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
            {duration && (
              <div className="flex items-center">
                <span className="bg-gray-200 text-gray-900 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Duration: {duration}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Budget: ${project.budget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Client: {project.client}
              </span>
            </div>
            <div className="flex items-center">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Site: {project.site?.name}
              </span>
            </div>
            {project.progress !== undefined && (
              <div className="flex items-center">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Progress: {project.progress}%
                </span>
              </div>
            )}
            {project.isFavourite && (
              <div className="flex items-center">
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Favourite: ⭐
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="flex items-center mb-1 text-gray-700 font-semibold text-sm sm:text-base">
                <User className="w-4 h-4 mr-2" />
                Assigned to:
              </span>
              <div className="flex flex-wrap gap-2">
                {memberDetails.length > 0 ? (
                  memberDetails.map((member, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs sm:text-sm"
                    >
                      {member.name} {member.role && `(${member.role})`}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-sm text-gray-500">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm sm:text-base font-medium rounded-t-lg transition-colors duration-200 ${
                activeTab === tab.key
                  ? "bg-white border-t border-l border-r shadow"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6 bg-white border border-t-0 rounded-b-lg shadow-sm">
        {tabs.find((t) => t.key === activeTab)?.component}
      </div>

      {/* Tasks Section */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Tasks
        </h2>
        {project.tasks && project.tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <TaskTable
              projectTitle={project.title}
              tasks={project.tasks}
              projectId={projectId}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (canCreate) {
                  setShowCreateForm(true);
                } else {
                  toast.error("You do not have permission to create tasks.");
                }
              }}
              className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 disabled:opacity-50 text-sm sm:text-base"
              disabled={!canCreate}
              title={
                canCreate ? "" : "You do not have permission to create tasks"
              }
            >
              <Plus className="inline-block mr-2 w-4 h-4" />
              Add Task
            </button>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
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
