import React, { useEffect, useRef } from "react";
import { FrappeGantt, Task, ViewMode } from "frappe-gantt-react";
import { Project } from "@/types/project";

interface GanttChartProps {
  projects: Project[];
  viewMode?: ViewMode;
  onDateChange?: (projects: Project[]) => void;
  onProgressChange?: (projects: Project[]) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({
  projects,
  viewMode = ViewMode.Week,
  onDateChange,
  onProgressChange,
}) => {
  const ganttRef = useRef<FrappeGantt>(null);

  useEffect(() => {
    // you could access ganttRef.current.gantt if needed
  }, []);

  const colorClasses = [
    "gantt-color-red",
    "gantt-color-blue",
    "gantt-color-green",
    "gantt-color-purple",
    "gantt-color-orange",
    "gantt-color-teal",
    "gantt-color-pink",
    "gantt-color-yellow",
  ];

  // Map Project[] to Task[] for FrappeGantt
  const tasks = projects.map((project, index) => {
    const start =
      typeof project.start_date === "string"
        ? project.start_date
        : project.start_date.toISOString().substr(0, 10);
    const end =
      typeof project.end_date === "string"
        ? project.end_date
        : project.end_date.toISOString().substr(0, 10);

    const colorClass = colorClasses[index % colorClasses.length];

    return {
      id: project.id.toString(),
      name: project.title,
      start,
      end,
      progress: project.progress ?? 0,
      dependencies: (project.members || []).join(","),
      custom_class: colorClass,
    };
  }) as Task[];

  return (
    <div className="overflow-auto">
      <FrappeGantt
        ref={ganttRef}
        tasks={tasks}
        viewMode={viewMode}
        onDateChange={() => {
          onDateChange?.(projects);
        }}
        onProgressChange={() => {
          onProgressChange?.(projects);
        }}
      />
    </div>
  );
};

export default GanttChart;
