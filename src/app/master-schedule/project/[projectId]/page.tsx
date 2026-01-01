"use client";

import React, { useState } from "react";
import TaskTable from "@/components/master-schedule/TaskTable";
import ActualTaskTable from "@/components/master-schedule/ActualTaskTable";
import { useProject } from "@/hooks/useProjects";
import { useParams } from "next/navigation";

const ProjectTaskPage: React.FC = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { data: project, isLoading, isError } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<"planned" | "actual">("planned");

  if (isLoading) return <div>Loading project...</div>;
  if (isError || !project) return <div>Error loading project.</div>;

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">{project.title}</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 min-w-max">
          <button
            onClick={() => setActiveTab("planned")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "planned"
                ? "border-b-4 border-cyan-600 text-cyan-700 bg-cyan-50/50"
                : "text-gray-400 hover:text-gray-600 border-b-4 border-transparent"
              }`}
          >
            Planned Tasks
          </button>
          <button
            onClick={() => setActiveTab("actual")}
            className={`whitespace-nowrap px-4 py-3 text-sm font-black uppercase tracking-widest transition-all ${activeTab === "actual"
                ? "border-b-4 border-cyan-600 text-cyan-700 bg-cyan-50/50"
                : "text-gray-400 hover:text-gray-600 border-b-4 border-transparent"
              }`}
          >
            Actual Tasks
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

export default ProjectTaskPage;
