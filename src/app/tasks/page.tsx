"use client";

import BreadcrumbTasks from "@/components/tasks/BreadcrumbTasks";
import Card from "@/components/ui/Card";
import React, { useState } from "react";
import { CheckCircle, Loader, Clock, XCircle } from "lucide-react";
import Filters from "@/components/tasks/Filters";
import DataTable from "@/components/tasks/DataTable";
import { useTasks } from "@/hooks/useTasks";
import TaskForm from "@/components/forms/TaskForm";

const TasksPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data: tasks, isLoading, isError } = useTasks();

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

  if (isLoading) return <div>Loading tasks...</div>;
  if (isError) return <div>Failed to load tasks.</div>;

  return ( 
    <div className="mx-auto max-w-full px-4">
      {/* Breadcrumb and Stats Cards */}
      <BreadcrumbTasks onPlusClick={() => setShowForm(true)} />
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

      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <TaskForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mt-6">
        <Filters />
      </div>

      {/* Table Section */}
      <div className="mt-6 max-w-full overflow-hidden">
        <DataTable />
      </div>
    </div>
  );
};

export default TasksPage;
