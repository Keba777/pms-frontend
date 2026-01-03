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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GenericFilter, FilterField, FilterValues } from "@/components/common/GenericFilter";
import { CheckSquare, ListTodo } from "lucide-react";

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

  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const filterFields: FilterField[] = [
    {
      name: "task_name",
      label: "Task Name",
      type: "text",
      placeholder: "Search by task name..."
    },
    {
      name: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { label: "Not Started", value: "Not Started" },
        { label: "Started", value: "Started" },
        { label: "InProgress", value: "InProgress" },
        { label: "Onhold", value: "Onhold" },
        { label: "Completed", value: "Completed" },
        { label: "Canceled", value: "Canceled" },
      ],
      placeholder: "Filter by Status"
    },
    {
      name: "priority",
      label: "Priority",
      type: "multiselect",
      options: [
        { label: "Low", value: "Low" },
        { label: "Medium", value: "Medium" },
        { label: "High", value: "High" },
        { label: "Critical", value: "Critical" },
      ],
      placeholder: "Filter by Priority"
    },
    {
      name: "dateRange",
      label: "Date Range",
      type: "daterange"
    }
  ];

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
      <div className="mt-8">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full mt-8">
        <div className="flex justify-start w-full mb-6 border-b border-gray-200 pb-2">
          <TabsList className="bg-muted p-1 rounded-full inline-flex h-auto">
            <TabsTrigger
              value="planned"
              className="flex items-center space-x-2 py-2 px-6 text-sm font-bold rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground uppercase"
            >
              <ListTodo className="w-4 h-4" />
              <span>Planned Tasks</span>
            </TabsTrigger>
            <TabsTrigger
              value="actual"
              className="flex items-center space-x-2 py-2 px-6 text-sm font-bold rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground uppercase"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Actual Tasks</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="planned" className="mt-6 outline-none">
          <div className="max-w-full overflow-hidden min-h-[400px]">
            <TaskSection externalFilters={filterValues} />
          </div>
        </TabsContent>
        <TabsContent value="actual" className="mt-6 outline-none">
          <div className="max-w-full overflow-hidden min-h-[400px]">
            <ActualTaskTable externalFilters={filterValues} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksPage;
