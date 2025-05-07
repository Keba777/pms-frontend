// components/master-schedule/ProjectGanttChart.tsx
import React from "react";
import "gantt-task-react/dist/index.css";
import { ViewMode, Gantt, Task } from "gantt-task-react";
import { Project } from "@/types/project";

interface ProjectGanttChartProps {
  projects: Project[];
  /** Choose between Day, Week, Month, Quarter, etc. */
  viewMode?: ViewMode;
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({
  projects,
  viewMode = ViewMode.Week,
}) => {
  const tasks: Task[] = projects.map((project) => ({
    id: project.id,
    name: project.title,
    start: new Date(project.start_date),
    end: new Date(project.end_date),
    type: "project",
    progress: project.progress ?? 0,
    isDisabled: false,
    styles: {
      progressColor: "#34d399",
      progressSelectedColor: "#059669",
    },
    dependencies: [],
  }));

  return (
    <div className="overflow-x-auto bg-white rounded-md shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">Project Gantt Chart</h3>
      <div style={{ height: 500 }}>
        <Gantt
          tasks={tasks}
          viewMode={viewMode}
          listCellWidth="120"   // narrower list panel for name/from/to
          columnWidth={120}     // wider columns for timeline
          rowHeight={40}
        />
      </div>
    </div>
  );
};

export default ProjectGanttChart;
