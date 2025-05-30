"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActivities,
  useDeleteActivity,
  useUpdateActivity,
} from "@/hooks/useActivities";
import { UpdateActivityInput } from "@/types/activity";
import { formatDate, getDuration } from "@/utils/helper";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import ActivityTableSkeleton from "./ActivityTableSkeleton";
import RoleName from "../common/RoleName";
import SearchInput from "../ui/SearchInput";
import ManageActivityForm from "../forms/ManageActivityForm";

const DataTableActivities: React.FC = () => {
  const { data: activities = [], isLoading, error } = useActivities();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();

  const [searchTerm, setSearchTerm] = useState("");
  const columnOptions: Record<string, string> = {
    activity_name: "Activity",
    assignedUsers: "Assigned To",
    priority: "Priority",
    quantity: "Quantity",
    unit: "Unit",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    progress: "Progress",
    materials: "Materials",
    equipments: "Equipments",
    labors: "Labors",
    request: "Request",
    status: "Status",
    approvalStatus: "Approval",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowColumnMenu(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Edit modal
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);

  // Manage modal
  const [showManageForm, setShowManageForm] = useState(false);
  const [activityToManage, setActivityToManage] =
    useState<UpdateActivityInput | null>(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  const router = useRouter();

  if (isLoading) return <ActivityTableSkeleton />;
  if (error) return <div>Error fetching activities.</div>;

  const filteredActivities = activities.filter((act) =>
    act.activity_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteActivityClick = (id: string) => {
    setSelectedActivityId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteActivity = () => {
    if (selectedActivityId) {
      deleteActivity(selectedActivityId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewActivity = (id: string) => {
    router.push(`/activities/${id}`);
  };

  const handleEditClick = (activity: UpdateActivityInput) => {
    setActivityToEdit(activity);
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
  };

  const handleManageClick = (activity: UpdateActivityInput) => {
    setActivityToManage(activity);
    setShowManageForm(true);
  };

  const handleManageSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowManageForm(false);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 mt-6">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
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
                  {label || <span> </span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <SearchInput
          placeholder="Search activities..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* Modals */}
      {showEditForm && activityToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <EditActivityForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              activity={activityToEdit}
            />
          </div>
        </div>
      )}

      {showManageForm && activityToManage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <ManageActivityForm
              onClose={() => setShowManageForm(false)}
              onSubmit={handleManageSubmit}
              activity={activityToManage}
            />
          </div>
        </div>
      )}

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("activity_name") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Activity
                </th>
              )}
              {selectedColumns.includes("assignedUsers") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Assigned To
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Priority
                </th>
              )}
              {selectedColumns.includes("quantity") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Quantity
                </th>
              )}
              {selectedColumns.includes("unit") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Unit
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Duration
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Progress
                </th>
              )}
              {(selectedColumns.includes("materials") ||
                selectedColumns.includes("equipments") ||
                selectedColumns.includes("labors")) && (
                <th
                  colSpan={3}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Resources
                </th>
              )}
              {selectedColumns.includes("request") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Request
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Status
                </th>
              )}
              {selectedColumns.includes("approvalStatus") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Approval
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Actions
                </th>
              )}
            </tr>
            <tr>
              {selectedColumns.includes("materials") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Materials
                </th>
              )}
              {selectedColumns.includes("equipments") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Equipments
                </th>
              )}
              {selectedColumns.includes("labors") && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                  Labors
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("activity_name") && (
                    <td className="px-4 py-2 font-medium text-bs-primary">
                      <Link
                        href={`/activities/${activity.id}`}
                        className="hover:underline"
                      >
                        {activity.activity_name}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("assignedUsers") && (
                    <td className="px-4 py-2">
                      {activity.assignedUsers?.length ? (
                        <ul className="list-none space-y-1">
                          {activity.assignedUsers.map((u) => (
                            <li key={u.id}>
                              {u.first_name} {u.last_name} (
                              <RoleName roleId={u.role_id} />)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  )}
                  {selectedColumns.includes("priority") && (
                    <td className="px-4 py-2">
                      <span
                        className={`badge bg-gray-100 px-2 py-1 rounded ${
                          activity.priority === "Critical"
                            ? "text-red-600"
                            : activity.priority === "High"
                            ? "text-orange-500"
                            : activity.priority === "Medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {activity.priority}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-4 py-2">{activity.quantity ?? "–"}</td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="px-4 py-2">{activity.unit}</td>
                  )}
                  {selectedColumns.includes("start_date") && (
                    <td className="px-4 py-2">
                      {formatDate(activity.start_date)}
                    </td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="px-4 py-2">
                      {formatDate(activity.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("duration") && (
                    <td className="px-4 py-2">
                      {getDuration(activity.start_date, activity.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("progress") && (
                    <td className="px-4 py-2">
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
                  )}
                  {selectedColumns.includes("materials") && (
                    <td className="px-4 py-2">
                      {activity.requests?.reduce(
                        (sum, req) => sum + (req.materialCount || 0),
                        0
                      ) || 0}
                    </td>
                  )}
                  {selectedColumns.includes("equipments") && (
                    <td className="px-4 py-2">
                      {activity.requests?.reduce(
                        (sum, req) => sum + (req.equipmentCount || 0),
                        0
                      ) || 0}
                    </td>
                  )}
                  {selectedColumns.includes("labors") && (
                    <td className="px-4 py-2">
                      {activity.requests?.reduce(
                        (sum, req) => sum + (req.laborCount || 0),
                        0
                      ) || 0}
                    </td>
                  )}
                  {selectedColumns.includes("request") && (
                    <td className="px-4 py-2">
                      <Link
                        href={`/resources/${activity.id}`}
                        className="flex items-center text-emerald-700 hover:underline"
                      >
                        Request
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2">
                      <span className="badge bg-label-secondary">
                        {activity.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("approvalStatus") && (
                    <td className="px-4 py-2">{activity.approvalStatus}</td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="px-4 py-2">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() => handleViewActivity(activity.id)}
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                  handleEditClick({
                                    ...activity,
                                    assignedUsers: activity.assignedUsers?.map(
                                      (u) => u.id
                                    ),
                                  })
                                }
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                  handleDeleteActivityClick(activity.id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                                onClick={() =>
                                  handleManageClick({
                                    ...activity,
                                    assignedUsers: activity.assignedUsers?.map(
                                      (u) => u.id
                                    ),
                                  })
                                }
                              >
                                Manage
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No activities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing {filteredActivities.length} rows
          </span>
          <select className="rounded border-gray-300 text-sm">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            ‹
          </button>
          <button className="px-3 py-1 rounded border bg-gray-100">1</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTableActivities;
