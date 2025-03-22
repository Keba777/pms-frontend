"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import ActivityTable from "./ActivityTable";
import { Task } from "@/types/task";

interface TaskTableProps {
  tasks: Task[];
  projectTitle?: string;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, projectTitle }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

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

  return (
    <div className="ml-3 mb-6">
      {/* Header moved into the TaskTable */}
      {projectTitle && (
        <div className="bg-white py-2 rounded-lg flex items-center justify-between mb-4 px-4">
          <div className="font-bold text-xl text-teal-700">
            Project:{" "}
            <span className="font-semibold ml-1 text-bs-gray-dark">
              {projectTitle}
            </span>
          </div>
          <div className="font-bold text-xl text-teal-700">
            Total Tasks:{" "}
            <span className="font-semibold ml-1 text-bs-gray-dark">
              {tasks.length}
            </span>
          </div>
          <button className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800">
            Create Task
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-teal-700">
            <tr>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                No
              </th>
              <th className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50">
                Task
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.length ? (
              tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <button
                        onClick={() =>
                          setExpandedTaskId(
                            expandedTaskId === task.id ? null : task.id
                          )
                        }
                        className="p-1 bg-teal-700 text-gray-200 hover:bg-gray-200 hover:text-teal-700 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2 font-medium">
                      {task.task_name}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {formatDate(task.start_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {formatDate(task.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      {getDuration(task.start_date, task.end_date)}
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <span className="badge bg-label-secondary">
                        {task.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 pl-5 pr-7 py-2">
                      <button className="px-3 py-1 bg-teal-700 text-gray-200 hover:bg-gray-200 hover:text-teal-700 rounded">
                        Actions
                      </button>
                    </td>
                  </tr>
                  {expandedTaskId === task.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-gray-200 pl-5 pr-7 py-2 bg-gray-50"
                      >
                        <ActivityTable taskId={task.id} />
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
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
