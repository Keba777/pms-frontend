"use client"

import TaskTable from "@/components/master-schedule/TaskTable";
import { useProject } from "@/hooks/useProjects";
import React from "react";

interface ClientProjectTaskProps {
  projectId: string;
}

const ClientProjectTask = ({ projectId }: ClientProjectTaskProps) => {
  const { data: project, isLoading, isError } = useProject(projectId!);

  if (isLoading) return <div>Loading project...</div>;
  if (isError || !project) return <div>Error loading project.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <TaskTable
        tasks={project.tasks || []}
        projectTitle={project.title}
        projectId={project.id}
      />
    </div>
  );
};

export default ClientProjectTask;
