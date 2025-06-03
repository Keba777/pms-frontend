"use client";

import React, { useState } from "react";
import { useTask } from "@/hooks/useTasks";
import ActivityTable from "@/components/master-schedule/ActivityTable";
import ActualActivityTable from "@/components/master-schedule/ActualActivityTable";

interface ClientTaskActivityProps {
  taskId: string;
}

const ClientTaskActivity: React.FC<ClientTaskActivityProps> = ({ taskId }) => {
  const { data: task, isLoading, isError } = useTask(taskId);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");

  if (isLoading) return <div>Loading task...</div>;
  if (isError || !task) return <div>Error loading task.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{task.task_name}</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
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

      {/* Tab Content */}
      {activeTab === "planned" ? (
        <ActivityTable taskId={task.id} />
      ) : (
        <ActualActivityTable taskId={task.id} />
      )}
    </div>
  );
};

export default ClientTaskActivity;
