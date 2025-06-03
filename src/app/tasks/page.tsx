// pages/tasks/index.tsx
"use client";

import React, { useState } from "react";
import BreadcrumbTasks from "@/components/tasks/BreadcrumbTasks";
import Card from "@/components/ui/Card";
import { CheckCircle, Loader, Clock, XCircle } from "lucide-react";
import DataTable from "@/components/tasks/DataTable";
import ActualTaskTable from "@/components/tasks/ActualTaskTable";
import DataTableSkeleton from "@/components/tasks/DataTableSkeleton";
import { useTasks } from "@/hooks/useTasks";

const TasksPage: React.FC = () => {
  const { data: tasks, isLoading, isError } = useTasks();
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");

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
  );

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Breadcrumb and Stats Cards */}
      <BreadcrumbTasks />
      <div className="flex flex-wrap -mx-2 mt-4">
        <Card
          title="Completed"
          count={statusCounts?.Completed || 0}
          link="/projects"
          Icon={CheckCircle}
          color="green-500"
        />
        <Card
          title="In Progress"
          count={statusCounts?.InProgress || 0}
          link="/tasks"
          Icon={Loader}
          color="blue-500"
        />
        <Card
          title="Not Started"
          count={statusCounts?.["Not Started"] || 0}
          link="/users"
          Icon={Clock}
          color="yellow-500"
        />
        <Card
          title="Cancelled"
          count={statusCounts?.Canceled || 0}
          link="/clients"
          Icon={XCircle}
          color="cyan-500"
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab("planned")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "planned"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Planned
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "actual"
                ? "border-b-2 border-emerald-600 text-emerald-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Actual
          </button>
        </nav>
      </div>

      {/* Table Section */}
      <div className="mt-6 max-w-full overflow-hidden">
        {isLoading ? (
          <DataTableSkeleton />
        ) : isError ? (
          <div>Failed to load tasks.</div>
        ) : activeTab === "planned" ? (
          <DataTable />
        ) : (
          <ActualTaskTable />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
