// components/master-schedule/ProjectGanttChart.tsx
"use client";

import React, { useRef, useMemo } from "react";
import {
  FrappeGantt,
  Task as GanttTaskClass,
  ViewMode,
} from "frappe-gantt-react";
import { useTasks } from "@/hooks/useTasks";
import { useActivities } from "@/hooks/useActivities";
import { Project } from "@/types/project";

export interface ProjectGanttChartProps {
  /** The array of projects to render on the chart */
  projects: Project[];
  /** Optional: initial view mode (Day / Week / Month / Year) */
  viewMode?: ViewMode;
  /** Optional callback whenever a task’s dates are changed */
  onDateChange?: (projects: Project[]) => void;
  /** Optional callback whenever a task’s progress is changed */
  onProgressChange?: (projects: Project[]) => void;
}

/** Returns a random hex color string like "#3e92cc" */
const generateRandomHexColor = (): string => {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `#${hex}`;
};

/**
 * Ensures a Date or ISO-string is returned in "YYYY-MM-DD" format.
 * Frappe Gantt expects date strings like "2025-06-15".
 */
const toDateString = (date: Date | string | undefined): string => {
  if (!date) {
    return new Date().toISOString().substr(0, 10);
  }
  if (typeof date === "string") {
    return date;
  }
  return date.toISOString().substr(0, 10);
};

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({
  projects,
  viewMode = ViewMode.Week,
  onDateChange,
  onProgressChange,
}) => {
  // Fetch all tasks & activities once. We’ll filter per project below.
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useTasks();

  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    isError: isActivitiesError,
  } = useActivities();

  const ganttRef = useRef<FrappeGantt>(null);

  /**
   * We’ll build two things in a single pass over projects/tasks/activities:
   *  1) An array of GanttTaskClass instances (each with `custom_class: "<uniqueClassName>"`)
   *  2) A map from that uniqueClassName → randomly generated hex color, so we can inject CSS later.
   */
  const { ganttTasks, cssText } = useMemo(() => {
    // This will hold all Task instances for Frappe Gantt
    const allTasks: GanttTaskClass[] = [];
    // This will collect CSS rules for each custom_class we assign
    let cssRules = "";

    projects.forEach((project) => {
      // 1) PROJECT BAR
      const projColor = generateRandomHexColor(); // e.g. "#3e92cc"
      const projClass = `bar-project-${project.id}`; // e.g. "bar-project-42"
      const projectStart = toDateString(project.start_date);
      const projectEnd = toDateString(project.end_date);

      // Append CSS for this project’s bar
      cssRules += `
        /* Project ${project.id} */
        .${projClass} .bar {
          fill: ${projColor};
          stroke: ${projColor};
        }
        .${projClass} .bar-progress {
          fill: ${projColor};
        }
      `;

      // Create GanttTask for the project
      const projectTask = new GanttTaskClass({
        id: `project-${project.id}`,
        name: project.title,
        start: projectStart,
        end: projectEnd,
        progress: project.progress ?? 0,
        dependencies: "",
        custom_class: projClass,
      });
      allTasks.push(projectTask);

      // 2) TASKS UNDER THIS PROJECT
      const projectTasks = tasks.filter(
        (t) => t.project_id === project.id
      );
      projectTasks.forEach((appTask) => {
        const taskColor = generateRandomHexColor();
        const taskClass = `bar-task-${project.id}-${appTask.id}`;
        const taskStart = toDateString(appTask.start_date);
        const taskEnd = toDateString(appTask.end_date);

        // Append CSS for this task’s bar
        cssRules += `
          /* Task ${appTask.id} in project ${project.id} */
          .${taskClass} .bar {
            fill: ${taskColor};
            stroke: ${taskColor};
          }
          .${taskClass} .bar-progress {
            fill: ${taskColor};
          }
        `;

        const taskInstance = new GanttTaskClass({
          id: `task-${project.id}-${appTask.id}`,
          name: `  ${appTask.task_name}`,
          start: taskStart,
          end: taskEnd,
          progress: appTask.progress ?? 0,
          dependencies: "",
          custom_class: taskClass,
        });
        allTasks.push(taskInstance);

        // 3) ACTIVITIES UNDER THIS TASK
        const relatedActivities = activities.filter(
          (act) => act.task_id === appTask.id
        );
        relatedActivities.forEach((act) => {
          const actColor = generateRandomHexColor();
          const actClass = `bar-activity-${project.id}-${appTask.id}-${act.id}`;
          const activityStart = toDateString(act.start_date);
          const activityEnd = toDateString(act.end_date);

          // Append CSS for this activity’s bar
          cssRules += `
            /* Activity ${act.id} under task ${appTask.id} (project ${project.id}) */
            .${actClass} .bar {
              fill: ${actColor};
              stroke: ${actColor};
            }
            .${actClass} .bar-progress {
              fill: ${actColor};
            }
          `;

          const activityInstance = new GanttTaskClass({
            id: `activity-${project.id}-${appTask.id}-${act.id}`,
            name: `    ${act.activity_name}`,
            start: activityStart,
            end: activityEnd,
            progress: act.progress ?? 0,
            dependencies: "",
            custom_class: actClass,
          });
          allTasks.push(activityInstance);
        });
      });
    });

    return {
      ganttTasks: allTasks,
      cssText: cssRules,
    };
  }, [projects, tasks, activities]);

  // Show loader if either tasks or activities are still fetching
  if (isTasksLoading || isActivitiesLoading) {
    return (
      <div className="p-4 text-center">
        Loading Gantt chart…
      </div>
    );
  }

  // Show an error if either hook errored
  if (isTasksError || isActivitiesError) {
    return (
      <div className="p-4 text-red-600 text-center">
        Error loading tasks/activities for Gantt chart.
      </div>
    );
  }

  return (
    <div className="overflow-auto p-4">
      {/* Inject our dynamically built CSS rules */}
      <style>{cssText}</style>

      <FrappeGantt
        ref={ganttRef}
        tasks={ganttTasks}
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

export default ProjectGanttChart;
