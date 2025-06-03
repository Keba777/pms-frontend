// components/ClientProjectTask.tsx
"use client";

import React, { useState } from "react";
import TaskTable from "@/components/master-schedule/TaskTable";
import ActualTaskTable from "@/components/master-schedule/ActualTaskTable";
import { useProject } from "@/hooks/useProjects";

interface ClientProjectTaskProps {
  projectId: string;
}

const ClientProjectTask: React.FC<ClientProjectTaskProps> = ({ projectId }) => {
  const { data: project, isLoading, isError } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");

  if (isLoading) return <div>Loading project...</div>;
  if (isError || !project) return <div>Error loading project.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>

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
        <TaskTable
          tasks={project.tasks || []}
          projectTitle={project.title}
          projectId={project.id}
        />
      ) : (
        <ActualTaskTable tasks={project.tasks || []} projectId={project.id} />
      )}
    </div>
  );
};

export default ClientProjectTask;
