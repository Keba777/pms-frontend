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
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-primary/10 text-primary",
};
const statusBadgeClasses: Record<Activity["status"], string> = {
  "Not Started": "bg-muted text-muted-foreground",
  Started: "bg-primary/10 text-primary",
  InProgress: "bg-yellow-100 text-yellow-800",
  Canceled: "bg-destructive/10 text-destructive",
  Onhold: "bg-amber-100 text-amber-800",
  Completed: "bg-primary/20 text-primary",
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
    useState<Activity | null>(null);
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
  const handleEditClick = (activity: Activity) => {
    setActivityToEdit(activity);
    setShowEditForm(true);
  };
  const handleEditSubmit = (data: UpdateActivityInput | FormData) => {
    updateActivity(data);
    setShowEditForm(false);
  };
  const handleManageClick = (activity: Activity) => {
    setActivityToManage(activity as any);
    setShowManageForm(true);
  };
  return (
    <div>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
        <div ref={menuRef} className="relative w-full lg:w-auto">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors shadow-sm font-medium"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-2 w-56 bg-white border border-border rounded-lg shadow-xl z-20 py-2">
              <div className="px-4 py-2 border-b border-border/50 mb-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Visible Columns</span>
              </div>
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary mr-3"
                  />
                  <span className="text-sm text-foreground font-medium">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <GenericFilter
            fields={filterFields}
            onFilterChange={setFilterValues}
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              placeholderText="From Date"
              className="rounded-lg border border-border px-4 py-2 text-sm focus:ring-2 focus:ring-primary font-medium w-full sm:w-36"
              dateFormat="yyyy-MM-dd"
            />
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              placeholderText="To Date"
              className="rounded-lg border border-border px-4 py-2 text-sm focus:ring-2 focus:ring-primary font-medium w-full sm:w-36"
              dateFormat="yyyy-MM-dd"
            />
          </div>
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
        <table className="min-w-max divide-y divide-border border">
          <thead className="bg-primary">
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
                    className="px-4 py-3 text-center border-b border-b-primary-foreground/30 text-sm font-medium text-primary-foreground"
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
          <tbody className="bg-white divide-y divide-border">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-accent">
                  {selectedColumns.includes("activity_name") && (
                    <td className="px-4 py-2 font-medium text-primary">
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
                        className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[activity.priority]
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
                      {format(activity.start_date)}
                    </td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="px-4 py-2">
                      {format(activity.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("duration") && (
                    <td className="px-4 py-2">
                      {getDuration(activity.start_date, activity.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("progress") && (
                    <td className="px-4 py-2">
                      <div className="relative h-5 bg-muted rounded">
                        <div
                          className="absolute h-full bg-primary rounded"
                          style={{ width: `${activity.progress}%` }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
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
                        className="flex items-center text-primary-foreground bg-primary/80 px-2 py-0.5 rounded text-xs hover:bg-primary transition-colors inline-block w-fit"
                      >
                        Request
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[activity.status]
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
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${active ? "bg-accent" : ""
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
                                className={`block w-full px-4 py-2 text-left ${active ? "bg-accent" : ""
                                  }`}
                                onClick={() =>
                                  handleEditClick(activity)
                                }
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full px-4 py-2 text-left ${active ? "bg-accent" : ""
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
                                className={`block w-full px-4 py-2 text-left ${active ? "bg-accent" : ""
                                  }`}
                                onClick={() =>
                                  handleManageClick(activity)
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
                  className="px-4 py-2 text-center text-muted-foreground"
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
          <span className="text-sm text-foreground">
            Showing {filteredActivities.length} rows
          </span>
          <select className="rounded border-border text-sm bg-white">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border border-border hover:bg-accent">
            ‹
          </button>
          <button className="px-3 py-1 rounded border border-border bg-muted">1</button>
          <button className="px-3 py-1 rounded border border-border hover:bg-accent">
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTableActivities;
