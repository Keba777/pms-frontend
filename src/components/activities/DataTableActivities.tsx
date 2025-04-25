"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActivities,
  useDeleteActivity,
  useUpdateActivity,
} from "@/hooks/useActivities";
import { useState } from "react";
import { UpdateActivityInput } from "@/types/activity";
import { formatDate, getDuration } from "@/utils/helper";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import ActivityTableSkeleton from "./ActivityTableSkeleton";
import { usePermissionsStore } from "@/store/permissionsStore";

const DataTableActivities = () => {
  const { data: activities, isLoading, error } = useActivities();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  const router = useRouter();

  // Retrieve permission checking from permissions store.
  const hasPermission = usePermissionsStore((state) => state.hasPermission);
  const canView = hasPermission("view activities");
  const canUpdate = hasPermission("edit activities");
  const canDelete = hasPermission("delete activities");

  if (isLoading) {
    return <ActivityTableSkeleton />;
  }

  if (error) {
    return <div>Error fetching activities.</div>;
  }

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
    <div>
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

      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Activity
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Priority
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Quantity
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Unit
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Start Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                End Date
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Duration
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Progress
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Approval
              </th>
              <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-2  w-[60px]">
                    <a
                      href="#"
                      className="text-bs-primary hover:underline font-medium block truncate"
                      title={activity.activity_name}
                    >
                      {activity.activity_name}
                    </a>
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`badge ${
                        activity.priority === "Critical"
                          ? "text-red-600"
                          : activity.priority === "High"
                          ? "text-orange-500"
                          : activity.priority === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      } bg-gray-100 px-2 py-1 rounded`}
                    >
                      {activity.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {activity.quantity !== undefined ? activity.quantity : "–"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {activity.unit}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(activity.start_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(activity.end_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {getDuration(activity.start_date, activity.end_date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="relative h-5 bg-gray-200 rounded">
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{ width: `${activity.progress}%` }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {activity.progress}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="badge bg-label-secondary">
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {activity.approvalStatus}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="relative inline-block">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  if (canUpdate) {
                                    setActivityToEdit(activity);
                                    setShowEditForm(true);
                                  } else {
                                    alert(
                                      "You do not have permission to update activities."
                                    );
                                  }
                                }}
                                disabled={!canUpdate}
                                title={
                                  !canUpdate
                                    ? "You do not have permission to update activities"
                                    : ""
                                }
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  if (canDelete) {
                                    handleDeleteActivityClick(activity.id);
                                  } else {
                                    alert(
                                      "You do not have permission to delete activities."
                                    );
                                  }
                                }}
                                disabled={!canDelete}
                                title={
                                  !canDelete
                                    ? "You do not have permission to delete activities"
                                    : ""
                                }
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  focus ? "bg-blue-100" : ""
                                }`}
                                onClick={() => {
                                  if (canView) {
                                    handleViewActivity(activity.id);
                                  } else {
                                    alert(
                                      "You do not have permission to view activities."
                                    );
                                  }
                                }}
                                disabled={!canView}
                                title={
                                  !canView
                                    ? "You do not have permission to view activities"
                                    : ""
                                }
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="px-4 py-2 text-center">
                  No activities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {activities?.length || 0} rows
          </span>
          <select className="rounded border-gray-300 text-sm">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            &lsaquo;
          </button>
          <button className="px-3 py-1 rounded border bg-gray-100">1</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            &rsaquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTableActivities;
