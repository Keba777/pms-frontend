"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Plus, ChevronDown } from "lucide-react";
import React from "react";
import TaskTable from "./TaskTable"; // Adjust the import path as needed

const ProjectTable = () => {
  const { data: projects, isLoading, isError } = useProjects();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null
  );
  const [dropdownProjectId, setDropdownProjectId] = useState<string | null>(
    null
  );

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    const dd = dateObj.getDate().toString().padStart(2, "0");
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const getDuration = (
    start: Date | string | null | undefined,
    end: Date | string | null | undefined
  ): string => {
    if (!start || !end) return "N/A";
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      return "Invalid Date";

    let totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    const years = Math.floor(totalDays / 365);
    totalDays %= 365;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? "Y" : "Ys"}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? "M" : "Ms"}`);
    if (days > 0 || parts.length === 0)
      parts.push(`${days} ${days === 1 ? "D" : "Ds"}`);
    return parts.join(", ");
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading projects</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>
      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                No
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                PROJECTS
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Start Date
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                End Date
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Duration
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects?.length ? (
              projects.map((project, index) => (
                <React.Fragment key={project.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        <button
                          onClick={() =>
                            setExpandedProjectId(
                              expandedProjectId === project.id
                                ? null
                                : project.id
                            )
                          }
                          className="p-1 bg-cyan-700 text-gray-200 hover:text-cyan-700 hover:bg-gray-200 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2 font-medium text-bs-primary">
                      {project.title}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {formatDate(project.start_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {formatDate(project.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {getDuration(project.start_date, project.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <span className="badge bg-label-secondary">
                        {project.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2 relative">
                      <button
                        onClick={() =>
                          setDropdownProjectId(
                            dropdownProjectId === project.id ? null : project.id
                          )
                        }
                        className="flex items-center justify-between gap-1 px-3 py-1 bg-cyan-700 text-gray-200 hover:text-cyan-700 hover:bg-gray-200 rounded w-full"
                      >
                        <span>Actions</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </button>
                      {dropdownProjectId === project.id && (
                        <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded shadow-lg z-10">
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                            View
                          </button>
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                            Edit
                          </button>
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-100">
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {expandedProjectId === project.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-gray-200 pl-5 pr-7 py-2 bg-gray-50"
                      >
                        <TaskTable
                          tasks={project.tasks || []}
                          projectTitle={project.title}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="border border-gray-200 pl-5 pr-7 py-2 text-center"
                >
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
