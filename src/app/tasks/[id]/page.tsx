"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { ArrowLeft, ListChecks, CheckCircle } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityTable from "@/components/master-schedule/ActivityTable";
import { Activity } from "@/types/activity";

const TaskDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);

  const task = tasks.find((p) => p.id === id);

  if (!task) {
    return (
      <div className="text-center text-red-500 mt-10">Task not found.</div>
    );
  }

  const getCountByStatus = (Activitys: Activity[], status: string): number => {
    return Activitys.filter((Activity) => Activity.status === status).length;
  };

  const ActivityStats = [
    {
      label: "Not Started",
      value: getCountByStatus(task.activities || [], "Not Started"),
      icon: <ListChecks size={18} />,
      iconColor: "#f87171",
      link: "/Activitys",
    },
    {
      label: "Started",
      value: getCountByStatus(task.activities || [], "Started"),
      icon: <ListChecks size={18} />,
      iconColor: "#facc15",
      link: "/Activitys",
    },
    {
      label: "In Progress",
      value: getCountByStatus(task.activities || [], "InProgress"),
      icon: <ListChecks size={18} />,
      iconColor: "#3b82f6",
      link: "/Activitys",
    },
    {
      label: "On Hold",
      value: getCountByStatus(task.activities || [], "Onhold"),
      icon: <ListChecks size={18} />,
      iconColor: "#f59e0b",
      link: "/Activitys",
    },
    {
      label: "Canceled",
      value: getCountByStatus(task.activities || [], "Canceled"),
      icon: <ListChecks size={18} />,
      iconColor: "#ef4444",
      link: "/Activitys",
    },
    {
      label: "Completed",
      value: getCountByStatus(task.activities || [], "Completed"),
      icon: <CheckCircle size={18} />,
      iconColor: "#10b981",
      link: "/Activitys",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex items-center space-x-4">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => router.push("/tasks")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Tasks
          </span>
        </button>
      </div>

      <h1 className="text-5xl font-bold text-cyan-800 mt-4">
        {task.task_name}
      </h1>
      {task.description && (
        <p className="text-gray-600 mt-2">{task.description}</p>
      )}

      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {task.status}
        </span>
      </div>

      {/* Activity Stats and Card Layout */}
      <div className="lg:flex mt-6 space-x-8">
        <div className="lg:w-1/3">
          <h2 className="text-4xl font-bold text-cyan-800">
            Activity Statistics
          </h2>
          <div className="mt-6">
            <StatsCard
              title="Activity Statistics"
              items={ActivityStats}
              total={task.activities?.length ?? 0}
            />
          </div>
        </div>

        {/* Right section for larger screens */}
        <div className="lg:w-2/3 mt-6 lg:mt-0 flex justify-center">
          <div className="w-full bg-gray-50 p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
              Task Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Priority Badge */}
              <div className="flex items-center">
                <span className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                  Priority: {task.priority}
                </span>
              </div>

              {/* Start Date */}
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Start Date: {new Date(task.start_date).toLocaleDateString()}
                </span>
              </div>

              {/* End Date */}
              <div className="flex items-center">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                  End Date: {new Date(task.end_date).toLocaleDateString()}
                </span>
              </div>

              {/* Assigned to */}
              <div className="flex items-center">
                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Assigned to: {task.assignedTo}
                </span>
              </div>

              {/* Approval Status */}
              <div className="flex items-center">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                  Approval Status: {task.approvalStatus}
                </span>
              </div>

              {/* Progress */}
              {task.progress !== undefined && (
                <div className="flex items-center">
                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
                    Progress: {task.progress}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {task.activities && task.activities.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold text-gray-800">Activities</h2>
          <div className="overflow-x-auto mt-4">
            <ActivityTable taskId={task.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPage;
