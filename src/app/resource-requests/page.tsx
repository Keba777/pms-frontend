"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useProjects } from "@/hooks/useProjects"; // Adjust the path if needed
import { useTasks } from "@/hooks/useTasks"; // Adjust the path if needed
import { Project } from "@/types/project";
import { Task } from "@/types/task";

const ResourceRequestsPage = () => {
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useTasks();

  const [selectAll, setSelectAll] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedProjects((projects ?? []).map((project) => project.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (
    projectId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    setSelectedProjects((prevSelected) =>
      checked
        ? [...prevSelected, projectId]
        : prevSelected.filter((id) => id !== projectId)
    );
  };

  if (projectsLoading || tasksLoading)
    return <div className="p-4">Loading...</div>;
  if (projectsError || tasksError)
    return <div className="p-4">Error loading data.</div>;

  // Map each status to a specific Tailwind background color
  const getStatusClasses = (status: Project["status"]) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-600";
      case "Started":
        return "bg-blue-600";
      case "InProgress":
        return "bg-green-600";
      case "Canceled":
        return "bg-red-600";
      case "Onhold":
        return "bg-yellow-600";
      case "Completed":
        return "bg-indigo-600";
      default:
        return "bg-gray-600";
    }
  };

  // For each project, calculate the total activity count from tasks
  const calculateActivityCount = (projectId: string) => {
    const projectTasks: Task[] = (tasks ?? []).filter(
      (task) => task.project_id === projectId
    );
    return projectTasks.reduce((total, task) => {
      return total + (task.activities ? task.activities.length : 0);
    }, 0);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resource Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 border border-gray-300 p-2 text-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="border border-gray-300 p-2 text-center text-xs font-medium text-gray-500 uppercase">
                No.
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Project Name
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Total Tasks
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Total Activity
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Budget
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actual Cost
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {projects?.map((project, index) => (
              <tr key={project.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={(e) => handleSelectProject(project.id, e)}
                  />
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-300 p-2">{project.title}</td>
                <td className="border border-gray-300 p-2">
                  {project.tasks ? project.tasks.length : 0}
                </td>
                <td className="border border-gray-300 p-2">
                  {calculateActivityCount(project.id)}
                </td>
                <td className="border border-gray-300 p-2">{project.budget}</td>
                <td className="border border-gray-300 p-2">-</td>
                <td className="border border-gray-300 p-2">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-medium text-white ${getStatusClasses(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="border border-gray-300 p-2">
                  <Link href={`/requests`}>
                    <span className="inline-flex flex-col items-center bg-cyan-700 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors cursor-pointer">
                      <ClipboardList className="w-4 h-4 mb-1" />
                      Request
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceRequestsPage;
