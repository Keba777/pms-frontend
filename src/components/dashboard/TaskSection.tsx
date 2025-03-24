"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

const TaskSection = () => {
  const { data: tasks, isLoading, isError } = useTasks();
  const [statusUpdates, setStatusUpdates] = useState<{ [key: string]: string }>(
    {}
  );

  const formatDate = (date: string | number | Date) => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString("en-GB");
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    setStatusUpdates((prev) => ({ ...prev, [taskId]: newStatus }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading tasks</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Tasks</h2>
      <div className="overflow-x-auto">
        <table className="min-w-max border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                ID
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Task
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Assigned To
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Priority
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Progress
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Starts At
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Ends At
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Approval
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Actions
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-50">
                Update Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.length ? (
              tasks.map((task, index) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 text-start px-4 py-2 font-medium text-bs-primary">
                    {task.task_name}
                  </td>

                  <td className="border border-gray-200 px-4 py-2">
                    {task.assignedTo || "N/A"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {task.priority}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {task.progress || 0}%
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {formatDate(task.start_date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {formatDate(task.end_date)}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      {task.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {task.approvalStatus}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <select className="bg-teal-800 text-gray-100 border rounded px-2 py-1">
                      <option disabled selected>
                        Action
                      </option>
                      <option value="edit">
                        <FaEdit className="inline mr-2" /> Edit
                      </option>
                      <option value="delete">
                        <FaTrash className="inline mr-2" /> Delete
                      </option>
                      <option value="quick-view">
                        <FaEye className="inline mr-2" /> Quick View
                      </option>
                    </select>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={statusUpdates[task.id] || task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value)
                      }
                    >
                      {[
                        "Not Started",
                        "Started",
                        "InProgress",
                        "Canceled",
                        "Onhold",
                        "Completed",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={12}
                  className="border border-gray-200 px-4 py-2 text-center"
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

export default TaskSection;
