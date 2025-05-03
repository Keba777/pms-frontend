// components/ProjectGanttChart.tsx
import React from "react";
import { ViewMode, Gantt, Task } from "gantt-task-react";
import { Project } from "@/types/project";

interface ProjectGanttChartProps {
  projects: Project[];
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projects }) => {
  const tasks: Task[] = projects.map((project) => ({
    id: project.id,
    name: project.title,
    start: new Date(project.start_date),
    end: new Date(project.end_date),
    type: "project",
    progress: project.progress || 0,
    isDisabled: false,
    styles: {
      progressColor: "#34d399", // Tailwind's green-400
      progressSelectedColor: "#059669", // green-600
    },
  }));

  return (
    <div className="overflow-x-auto bg-white rounded-md shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">Project Gantt Chart</h3>
      <Gantt tasks={tasks} viewMode={ViewMode.Day} />
    </div>
  );
};

export default ProjectGanttChart;
