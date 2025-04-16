// app/projects/[id]/ClientProjectDetail.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { ArrowLeft, ListChecks, CheckCircle } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import TaskTable from "@/components/master-schedule/TaskTable";
import { Task } from "@/types/task";

interface ClientProjectDetailProps {
  projectId: string;
}

export default function ClientProjectDetail({
  projectId,
}: ClientProjectDetailProps) {
  const router = useRouter();
  const projects = useProjectStore((state) => state.projects);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="text-center text-red-500 mt-10">
        Project not found.
      </div>
    );
  }

  const getCountByStatus = (tasks: Task[], status: string): number => {
    return tasks.filter((task) => task.status === status).length;
  };

  const taskStats = [
    {
      label: "Not Started",
      value: getCountByStatus(project.tasks || [], "Not Started"),
      icon: <ListChecks size={18} />,
      iconColor: "#f87171",
      link: "/tasks",
    },
    {
      label: "Started",
      value: getCountByStatus(project.tasks || [], "Started"),
      icon: <ListChecks size={18} />,
      iconColor: "#facc15",
      link: "/tasks",
    },
    {
      label: "In Progress",
      value: getCountByStatus(project.tasks || [], "InProgress"),
      icon: <ListChecks size={18} />,
      iconColor: "#3b82f6",
      link: "/tasks",
    },
    {
      label: "On Hold",
      value: getCountByStatus(project.tasks || [], "Onhold"),
      icon: <ListChecks size={18} />,
      iconColor: "#f59e0b",
      link: "/tasks",
    },
    {
      label: "Canceled",
      value: getCountByStatus(project.tasks || [], "Canceled"),
      icon: <ListChecks size={18} />,
      iconColor: "#ef4444",
      link: "/tasks",
    },
    {
      label: "Completed",
      value: getCountByStatus(project.tasks || [], "Completed"),
      icon: <CheckCircle size={18} />,
      iconColor: "#10b981",
      link: "/tasks",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex items-center space-x-4">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Projects
          </span>
        </button>
      </div>

      <h1 className="text-5xl font-bold text-cyan-800 mt-4">
        {project.title}
      </h1>
      {project.description && (
        <p className="text-gray-600 mt-2">{project.description}</p>
      )}

      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {project.status}
        </span>
      </div>

      {/* Task Stats and Card Layout */}
      <div className="lg:flex mt-6 space-x-8">
        <div className="lg:w-1/3">
          <h2 className="text-4xl font-bold text-cyan-800">
            Task Statistics
          </h2>
          <div className="mt-6">
            <StatsCard
              title="Task Statistics"
              items={taskStats}
              total={project.tasks?.length ?? 0}
            />
          </div>
        </div>

        {/* Right section for larger screens */}
        <div className="lg:w-2/3 mt-6 lg:mt-0 flex justify-center">
          <div className="w-full bg-gray-50 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Priority Badge */}
              <div className="flex items-center">
                <span className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Priority: {project.priority}
                </span>
              </div>

              {/* Start Date */}
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Start Date:{" "}
                  {new Date(project.start_date).toLocaleDateString()}
                </span>
              </div>

              {/* End Date */}
              <div className="flex items-center">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  End Date:{" "}
                  {new Date(project.end_date).toLocaleDateString()}
                </span>
              </div>

              {/* Budget */}
              <div className="flex items-center">
                <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Budget: ${project.budget.toLocaleString()}
                </span>
              </div>

              {/* Client */}
              <div className="flex items-center">
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Client: {project.client}
                </span>
              </div>

              {/* Site */}
              <div className="flex items-center">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Site: {project.site}
                </span>
              </div>

              {/* Progress */}
              {project.progress !== undefined && (
                <div className="flex items-center">
                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Progress: {project.progress}%
                  </span>
                </div>
              )}

              {/* Favourite */}
              {project.isFavourite && (
                <div className="flex items-center">
                  <span className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Favourite: ⭐
                  </span>
                </div>
              )}

              {/* Members */}
              {project.members && project.members.length > 0 && (
                <div className="flex items-center">
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Members: {project.members.join(", ")}
                  </span>
                </div>
              )}

              {/* Tags */}
              {project.tagIds && project.tagIds.length > 0 && (
                <div className="flex items-center">
                  <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Tags: {project.tagIds.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {project.tasks && project.tasks.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
          <div className="overflow-x-auto mt-4">
            <TaskTable
              projectTitle={project.title}
              tasks={project.tasks}
              projectId={projectId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
