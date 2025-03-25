"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import { Activity } from "@/types/activity";
import ActivityForm from "../forms/ActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteActivity } from "@/hooks/useActivities";

interface ActivityTableProps {
  taskId: string;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ taskId }) => {
  const { mutate: deleteActivity } = useDeleteActivity();

  const { data: taskDetail } = useTask(taskId);

  const [showForm, setShowForm] = useState(false);
  const [dropdownActivityId, setDropdownActivityId] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownActivityId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Early return if task is not found.
  if (!taskDetail) return <div className="p-4">Task not found</div>;

  const activities = taskDetail.activities as Activity[];
  const taskName = taskDetail.task_name || "Unknown Task";
  const totalActivities = activities?.length || 0;

  const handleDeleteActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteActivity = () => {
    if (selectedActivityId) {
      deleteActivity(selectedActivityId, {
        onSuccess: () => {
          // Optionally add success notification or refresh logic here
        },
        onError: () => {
          // Optionally add error notification here
        },
      });
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewActivity = (activityId: string) => {
    router.push(`/activities/${activityId}`);
  };

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
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-700"
        >
          Create Activity
        </button>

        {showForm && (
          <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="modal-content bg-white rounded-lg shadow-xl p-6">
              <ActivityForm
                onClose={() => setShowForm(false)}
                defaultTaskId={taskId}
              />
            </div>
          </div>
        )}
      </div>
      {/* Activity Table */}
      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-emerald-700 text-gray-200">
          <tr>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              No
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              Activity
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              Unit
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              Start Date
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              End Date
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              Duration
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              Resource
            </th>
            <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <tr key={activity.id} className="hover:bg-gray-50 relative">
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
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownActivityId(
                          dropdownActivityId === activity.id
                            ? null
                            : activity.id
                        );
                      }}
                      className="flex items-center justify-between gap-1 px-3 py-1 bg-white text-emerald-700 border border-emerald-700 hover:bg-gray-100 rounded w-full"
                    >
                      <span>Actions</span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                    {dropdownActivityId === activity.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50"
                      >
                        <button
                          onClick={() => {
                            setDropdownActivityId(null);
                            handleViewActivity(activity.id);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setDropdownActivityId(null);
                            // Implement edit functionality as needed
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDropdownActivityId(null);
                            handleDeleteActivityClick(activity.id);
                          }}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this activity?"
          showInput={true}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteActivity}
        />
      )}
    </div>
  );
};

export default ActivityTable;
