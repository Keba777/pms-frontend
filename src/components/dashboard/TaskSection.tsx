"use client";

import { useTasks } from "@/hooks/useTasks";
import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Link from "next/link";
import RoleName from "../common/RoleName";
import { Task } from "@/types/task";

const TaskSection: React.FC = () => {
  const { data: tasks, isLoading, isError } = useTasks();

  // mapping badge classes for priority
  const priorityBadgeClasses: Record<Task["priority"], string> = {
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };

  // mapping badge classes for status
  const statusBadgeClasses: Record<Task["status"], string> = {
    "Not Started": "bg-gray-100 text-gray-800",
    Started: "bg-blue-100 text-blue-800",
    InProgress: "bg-yellow-100 text-yellow-800",
    Onhold: "bg-amber-100 text-amber-800",
    Canceled: "bg-red-100 text-red-800",
    Completed: "bg-green-100 text-green-800",
  };

  const formatDate = (date: string | number | Date) => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString("en-GB");
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
                    <Link href={`tasks/${task.id}`}>{task.task_name}</Link>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {task.assignedUsers?.length ? (
                      <ul className="list-none space-y-1">
                        {task.assignedUsers.map((user) => (
                          <li key={user.id}>
                            {user.first_name} {user.last_name} (
                            <RoleName roleId={user.role_id} />)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        priorityBadgeClasses[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
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
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        statusBadgeClasses[task.status]
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {task.approvalStatus}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <select className="bg-teal-800 text-gray-100 border rounded px-2 py-1">
                      <option disabled value="">
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="border border-gray-200 px-4 py-2 text-center text-gray-500"
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
