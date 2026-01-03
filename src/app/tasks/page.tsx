// pages/tasks/index.tsx
"use client";

import React, { useState } from "react";
import BreadcrumbTasks from "@/components/tasks/BreadcrumbTasks";
import Card from "@/components/common/ui/Card";
import { CheckCircle, Loader, Clock, XCircle } from "lucide-react";
import DataTable from "@/components/tasks/DataTable";
import ActualTaskTable from "@/components/tasks/ActualTaskTable";
import DataTableSkeleton from "@/components/tasks/DataTableSkeleton";
import { useTasks } from "@/hooks/useTasks";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Task } from "@/types/task";
import { formatDate } from "@/utils/dateUtils";

import { getDateDuration } from "@/utils/dateUtils";

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

  // Planned columns
  const plannedColumns: Column<Task>[] = [
    { header: "Task Name", accessor: "task_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date) },
    { header: "Progress", accessor: (row) => `${row.progress ?? 0}%` },
    { header: "Status", accessor: "status" },
    { header: "Approval", accessor: "approvalStatus" },
  ];

  // Actual columns
  const actualColumns: Column<Task>[] = [
    { header: "Task Name", accessor: "task_name" },
    { header: "Priority", accessor: "priority" },
    { header: "Actual Start Date", accessor: (row) => row.actuals?.start_date ? formatDate(row.actuals.start_date) : "N/A" },
    { header: "Actual End Date", accessor: (row) => row.actuals?.end_date ? formatDate(row.actuals.end_date) : "N/A" },
    {
      header: "Actual Duration", accessor: (row) => {
        if (row.actuals?.start_date && row.actuals?.end_date) {
          return getDateDuration(row.actuals.start_date, row.actuals.end_date);
        }
        return "N/A";
      }
    },
    { header: "Actual Progress", accessor: (row) => `${row.actuals?.progress ?? 0}%` },
    { header: "Actual Status", accessor: (row) => row.actuals?.status ?? "N/A" },
    { header: "Actual Budget", accessor: (row) => row.actuals?.budget ?? "N/A" },
  ];

  // Prepare actual data
  const actualData = tasks?.map(task => ({
    ...task,
    actuals: task.actuals || {
      start_date: null,
      end_date: null,
      progress: null,
      status: null,
      budget: null,
    }
  })) || [];

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (isError) {
    return <div>Failed to load tasks.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 mt-4 gap-2">
        <BreadcrumbTasks />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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

      <GenericDownloads
        data={tasks || []}
        title="Planned Tasks"
        columns={plannedColumns}
        secondTable={{
          data: actualData,
          title: "Actual Tasks",
          columns: actualColumns,
        }}
      />

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="-mb-px flex space-x-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab("planned")}
            className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "planned"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
          >
            Planned Tasks
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`px-6 py-3 text-sm font-medium transition-all ${activeTab === "actual"
              ? "border-b-2 border-emerald-600 text-emerald-600"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
          >
            Actual Tasks
          </button>
        </nav>
      </div>

      {/* Table Section */}
      <div className="mt-6 max-w-full overflow-hidden">
        {activeTab === "planned" ? (
          <DataTable />
        ) : (
          <ActualTaskTable />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
