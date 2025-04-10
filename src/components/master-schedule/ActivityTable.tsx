"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import { Activity, UpdateActivityInput } from "@/types/activity";
import ActivityForm from "../forms/ActivityForm";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteActivity, useUpdateActivity } from "@/hooks/useActivities";
import Link from "next/link";
import { formatDate } from "@/utils/helper";
import { usePermissionsStore } from "@/store/permissionsStore";

interface ActivityTableProps {
  taskId: string;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ taskId }) => {
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const { data: taskDetail } = useTask(taskId);
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);
  const [dropdownActivityId, setDropdownActivityId] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Permission checks via the permissions store.
  const hasPermission = usePermissionsStore((state) => state.hasPermission);
  const canView = hasPermission("view activities");
  const canEdit = hasPermission("edit activities");
  const canDelete = hasPermission("delete activities");
  const canCreate = hasPermission("create activities");

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
      deleteActivity(selectedActivityId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewActivity = (activityId: string) => {
    if (canView) {
      router.push(`/activities/${activityId}`);
    } else {
      alert("You do not have permission to view this activity.");
    }
  };

  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
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
          onClick={() => {
            if (canCreate) {
              setShowForm(true);
            } else {
              alert("You do not have permission to create activities.");
            }
          }}
          className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50"
          disabled={!canCreate}
          title={
            !canCreate ? "You do not have permission to create activities" : ""
          }
        >
          Create Activity
        </button>
      </div>

      {/* Create Activity Modal */}
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

      {/* Edit Activity Modal */}
      {showEditForm && activityToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditActivityForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              activity={activityToEdit}
            />
          </div>
        </div>
      )}

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
              QTY
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
                  <Link href={`activities/${activity.id}`}>
                    {activity.activity_name}
                  </Link>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {activity.unit}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {activity.quantity}
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
                    className="flex items-center text-emerald-700 hover:underline"
                  >
                    Request
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
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                          disabled={!canView}
                          title={
                            !canView
                              ? "You do not have permission to view activities"
                              : ""
                          }
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setDropdownActivityId(null);
                            setActivityToEdit(activity);
                            setShowEditForm(true);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                          disabled={!canEdit}
                          title={
                            !canEdit
                              ? "You do not have permission to edit activities"
                              : ""
                          }
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDropdownActivityId(null);
                            handleDeleteActivityClick(activity.id);
                          }}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 disabled:opacity-50"
                          disabled={!canDelete}
                          title={
                            !canDelete
                              ? "You do not have permission to delete activities"
                              : ""
                          }
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
                colSpan={9}
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
