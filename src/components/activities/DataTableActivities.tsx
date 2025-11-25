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
import { Activity, UpdateActivityInput } from "@/types/activity";
import { getDuration } from "@/utils/helper";
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import ActivityTableSkeleton from "./ActivityTableSkeleton";
import ManageActivityForm from "../forms/ManageActivityForm";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "../common/GenericFilter";
import ProfileAvatar from "../common/ProfileAvatar";
import { useUsers } from "@/hooks/useUsers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const priorityBadgeClasses: Record<Activity["priority"], string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};
const statusBadgeClasses: Record<Activity["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Canceled: "bg-red-100 text-red-800",
  Onhold: "bg-amber-100 text-amber-800",
  Completed: "bg-green-100 text-green-800",
};
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
  request: "Request Resource",
  status: "Status",
  approvalStatus: "Approval",
  actions: "Actions",
};
const DataTableActivities: React.FC = () => {
  const { useEthiopianDate } = useSettingsStore();
  const { data: activities = [], isLoading, error } = useActivities();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const { data: users } = useUsers();
  const router = useRouter();
  // Filter state
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  // Column selection state
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Modal state
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [activityToManage, setActivityToManage] =
    useState<UpdateActivityInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  // Close column menu when clicking outside
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  const handleClickOutside = (e: Event) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowColumnMenu(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (isLoading) return <ActivityTableSkeleton />;
  if (error) return <div>Error fetching activities.</div>;
  // Filter options
  const priorityOptions: Option<string>[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" },
  ];
  const statusOptions: Option<string>[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ];
  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "activity_name",
      label: "Activity Name",
      type: "text",
      placeholder: "Search by name…",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: priorityOptions,
    },
    { name: "status", label: "Status", type: "select", options: statusOptions },
  ];
  const filteredActivities = activities.filter((activity) => {
    return (
      Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true; // skip if no filter value
        if (key === "status" || key === "priority") {
          return activity[key] === value;
        }
        if (key === "activity_name") {
          return activity.activity_name
            ?.toLowerCase()
            .includes((value as string).toLowerCase());
        }
        return true;
      }) &&
      (fromDate ? new Date(activity.start_date) >= fromDate : true) &&
      (toDate ? new Date(activity.end_date) <= toDate : true)
    );
  });
  // Handlers
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
  const handleViewActivity = (id: string) => router.push(`/activities/${id}`);
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
  return (
    <div>
      <div className="mb-5 flex space-x-4 justify-between">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 whitespace-nowrap"
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
        <div className="flex flex-col sm:flex-row gap-2 ">
          <GenericFilter
            fields={filterFields}
            onFilterChange={setFilterValues}
          />
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            placeholderText="From Date"
            className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            dateFormat="yyyy-MM-dd"
          />
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            placeholderText="To Date"
            className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>
      {/* Modals */}
      {showEditForm && activityToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditActivityForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              activity={activityToEdit}
              users={users}
            />
          </div>
        </div>
      )}
      {showManageForm && activityToManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageActivityForm
              onClose={() => setShowManageForm(false)}
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
      <div className="overflow-x-auto px-2 ">
        <table className="min-w-max divide-y divide-gray-200 border">
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
                  className="px-4 py-3 text-center border-b border-b-gray-400 text-sm font-medium text-gray-50"
                >
                  Resource Cost
                </th>
              )}
              {selectedColumns.includes("request") && (
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-50"
                >
                  Request Resource
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
                        {activity.activity_name.charAt(0).toUpperCase() +
                          activity.activity_name.slice(1)}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("assignedUsers") && (
                    <td className="px-4 py-2">
                      {activity.assignedUsers?.length ? (
                        <ul className="flex space-x-2">
                          {activity.assignedUsers.map((u) => (
                            <ProfileAvatar key={u.id} user={u} />
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
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          priorityBadgeClasses[activity.priority]
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
                      {format(activity.start_date, useEthiopianDate)}
                    </td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="px-4 py-2">
                      {format(activity.end_date, useEthiopianDate)}
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
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          statusBadgeClasses[activity.status]
                        }`}
                      >
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
