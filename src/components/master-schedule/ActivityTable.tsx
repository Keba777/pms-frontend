"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import { Activity, UpdateActivityInput } from "@/types/activity";
import ActivityForm from "../forms/ActivityForm";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteActivity, useUpdateActivity } from "@/hooks/useActivities";
import Link from "next/link";
import { formatDate, getDateDuration } from "@/utils/helper";
import ManageActivityForm from "../forms/ManageActivityForm";

interface ActivityTableProps {
  taskId: string;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ taskId }) => {
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const { data: taskDetail, isLoading: taskLoading } = useTask(taskId);
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Column customization
  const columnOptions: Record<string, string> = {
    no: "No",
    activity_name: "Activity",
    unit: "Unit",
    quantity: "QTY",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    resource: "Resource",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideMenu);
  }, []);

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownActivityId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  if (taskLoading) return <div className="p-4">Loading...</div>;
  if (!taskDetail) return <div className="p-4">Task not found</div>;

  const activities = taskDetail.activities as Activity[];
  const taskName = taskDetail.task_name || "Unknown Task";
  const totalActivities = activities.length;

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
    router.push(`/activities/${activityId}`);
  };

  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
  };

  const handleManageProgress = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowManageForm(false);
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
      {/* Header */}
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
          className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50"
        >
          Create Activity
        </button>
      </div>

      {/* Modals */}
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
      {showManageForm && activityToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <ManageActivityForm
              onClose={() => setShowManageForm(false)}
              onSubmit={handleManageProgress}
              activity={activityToEdit}
            />
          </div>
        </div>
      )}

      {/* Customize Columns Button */}
      <div className="flex items-center justify-between mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Table */}
      <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
        <thead className="bg-emerald-700 text-gray-200">
          <tr>
            {selectedColumns.includes("no") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.no}
              </th>
            )}
            {selectedColumns.includes("activity_name") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.activity_name}
              </th>
            )}
            {selectedColumns.includes("unit") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.unit}
              </th>
            )}
            {selectedColumns.includes("quantity") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.quantity}
              </th>
            )}
            {selectedColumns.includes("start_date") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.start_date}
              </th>
            )}
            {selectedColumns.includes("end_date") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.end_date}
              </th>
            )}
            {selectedColumns.includes("duration") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.duration}
              </th>
            )}
            {selectedColumns.includes("resource") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.resource}
              </th>
            )}
            {selectedColumns.includes("actions") && (
              <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium">
                {columnOptions.actions}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <tr className="hover:bg-gray-50 relative">
                  {selectedColumns.includes("no") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {index + 1}
                    </td>
                  )}
                  {selectedColumns.includes("activity_name") && (
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      <Link href={`/activities/${activity.id}`}>
                        {activity.activity_name}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {activity.unit}
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {activity.quantity}
                    </td>
                  )}
                  {selectedColumns.includes("start_date") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(activity.start_date)}
                    </td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {formatDate(activity.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("duration") && (
                    <td className="border border-gray-200 px-4 py-2">
                      {getDateDuration(activity.start_date, activity.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("resource") && (
                    <td className="border border-gray-200 px-4 py-2">
                      <Link
                        href={`/resources/${activity.id}`}
                        className="text-emerald-700 hover:underline"
                      >
                        Request
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="border border-gray-200 px-4 py-2 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownActivityId(
                            dropdownActivityId === activity.id
                              ? null
                              : activity.id
                          );
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-700 text-white rounded w-full"
                      >
                        Actions <ChevronDown className="w-4 h-4" />
                      </button>
                      {dropdownActivityId === activity.id && (
                        <div
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow-lg z-50"
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
                              setActivityToEdit({
                                ...activity,
                                assignedUsers: activity.assignedUsers
                                  ? activity.assignedUsers.map(
                                      (user: any) => user.id
                                    )
                                  : undefined,
                              });
                              setShowEditForm(true);
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
                          <button
                            onClick={() => {
                              setDropdownActivityId(null);
                              setActivityToEdit({
                                ...activity,
                                assignedUsers: activity.assignedUsers
                                  ? activity.assignedUsers.map(
                                      (user: any) => user.id
                                    )
                                  : undefined,
                              });
                              setShowManageForm(true);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100"
                          >
                            Manage
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td
                colSpan={selectedColumns.length}
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
          showInput={false}
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
