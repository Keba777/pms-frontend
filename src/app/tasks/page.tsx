// pages/tasks/index.tsx
"use client";

import React, { useState } from "react";
import BreadcrumbTasks from "@/components/tasks/BreadcrumbTasks";
import Card from "@/components/common/ui/Card";
import { CheckCircle, Loader, Clock, XCircle, Search } from "lucide-react";
import DataTable from "@/components/tasks/DataTable";
import ActualTaskTable from "@/components/tasks/ActualTaskTable";
import DataTableSkeleton from "@/components/tasks/DataTableSkeleton";
import { useTasks } from "@/hooks/useTasks";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Task } from "@/types/task";
import { formatDate } from "@/utils/dateUtils";

import { getDateDuration } from "@/utils/dateUtils";
import TaskSection from "@/components/dashboard/TaskSection";

const TasksPage: React.FC = () => {
  const { data: tasks, isLoading, isError } = useTasks();
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter counts based on task status
  const statusCounts = tasks?.reduce(
    (counts: { [key: string]: number }, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    },
    {
      Completed: 0,
      InProgress: 0,
      "Not Started": 0,
      Canceled: 0,
    }
  ) || {
    Completed: 0,
    InProgress: 0,
    "Not Started": 0,
    Canceled: 0,
  };

  if (isError) {
    return <div className="p-8 text-center text-red-600 font-medium">Failed to load tasks. Please try again later.</div>;
  }

  return (
    <div className="p-4 bg-gray-50/50 min-h-screen">
      <div className="flex flex-wrap justify-between items-center mb-4 mt-2 gap-2">
        <BreadcrumbTasks />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card
          title="Completed"
          count={statusCounts.Completed}
          link="/projects"
          Icon={CheckCircle}
          color="emerald-500"
        />
        <Card
          title="In Progress"
          count={statusCounts.InProgress}
          link="/tasks"
          Icon={Loader}
          color="blue-500"
        />
        <Card
          title="Not Started"
          count={statusCounts["Not Started"]}
          link="/users"
          Icon={Clock}
          color="amber-500"
        />
        <Card
          title="Cancelled"
          count={statusCounts.Canceled}
          link="/clients"
          Icon={XCircle}
          color="red-500"
        />
      </div>

      {/* Global Filtering Section */}
      <div className="mt-8 bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by task name or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${!statusFilter
                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/30"
                }`}
            >
              All Tasks
            </button>
            {["InProgress", "Completed", "Onhold", "Not Started", "Canceled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${statusFilter === status
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/30"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab("planned")}
            className={`px-4 py-4 text-sm font-bold transition-all relative ${activeTab === "planned"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
          >
            PLANNED TASKS
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`px-4 py-4 text-sm font-bold transition-all relative ${activeTab === "actual"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
              }`}
          >
            ACTUAL TASKS
          </button>
        </nav>
      </div>

      {/* Table Section */}
      <div className="mt-6 max-w-full overflow-hidden min-h-[400px]">
        {isLoading ? (
          <DataTableSkeleton />
        ) : activeTab === "planned" ? (
          <TaskSection searchTerm={searchTerm} statusFilter={statusFilter} />
        ) : (
          <ActualTaskTable searchTerm={searchTerm} statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
