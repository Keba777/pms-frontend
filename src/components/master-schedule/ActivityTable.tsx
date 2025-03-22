"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import { Activity } from "@/types/activity";

interface ActivityTableProps {
  taskId: string;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ taskId }) => {
  // Fetch the full task details (including activities) using the task id.
  const { data: taskDetail, isLoading, isError } = useTask(taskId);

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

  if (isLoading) return <div className="p-4">Loading activities...</div>;
  if (isError) return <div className="p-4">Error loading activities</div>;

  const activities = taskDetail?.activities as Activity[];
  const taskName = taskDetail?.task_name || "Unknown Task";
  const totalActivities = activities?.length || 0;

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
      {/* Header for Activities */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">
          Task: <span className="font-normal ml-1">{taskName}</span>
        </div>
        <div className="font-semibold">
          Total Activities:{" "}
          <span className="font-normal ml-1">{totalActivities}</span>
        </div>
        <button className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-700">
          Create Activity
        </button>
      </div>
      {/* Activity Table */}
      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-emerald-700 text-gray-200">
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              No
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              Activity
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              Unit
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              Start Date
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              End Date
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              Duration
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              Resource
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium ">
              Activity
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-200 px-4 py-2 font-medium">
                  {activity.activity_name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {activity.unit}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {formatDate(activity.start_date)}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {formatDate(activity.end_date)}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {getDuration(activity.start_date, activity.end_date)}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <a
                    href={`/resources/${activity.id}`}
                    className="flex items-center text-teal-700 hover:underline"
                  >
                    View Resource <ChevronRight className="ml-1 w-4 h-4" />
                  </a>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button className="px-3 py-1 bg-emerald-700 text-white hover:bg-emerald-800 rounded">
                    Manage
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className="border border-gray-200 px-4 py-2 text-center"
              >
                No activities found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
