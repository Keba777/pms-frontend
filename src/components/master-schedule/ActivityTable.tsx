"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import {
  Activity,
  UpdateActivityInput,
  CreateActivityInput,
} from "@/types/activity";
import ActivityForm from "../forms/ActivityForm";
import EditActivityForm from "../forms/EditActivityForm";
import ManageActivityForm from "../forms/ManageActivityForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { useRouter } from "next/navigation";
import {
  useDeleteActivity,
  useUpdateActivity,
  useCreateActivity,
} from "@/hooks/useActivities";
import Link from "next/link";
import { formatDate, getDateDuration } from "@/utils/helper";
import GenericDownloads, { Column } from "../common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "../common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { toast } from "react-toastify";

interface ActivityTableProps {
  taskId: string;
}

const statusBadgeClasses: Record<Activity["status"], string> = {
  "Not Started": "bg-gray-100 text-gray-800",
  Started: "bg-blue-100 text-blue-800",
  InProgress: "bg-yellow-100 text-yellow-800",
  Onhold: "bg-amber-100 text-amber-800",
  Canceled: "bg-red-100 text-red-800",
  Completed: "bg-green-100 text-green-800",
};

const priorityBadgeClasses: Record<Activity["priority"], string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const ActivityTable: React.FC<ActivityTableProps> = ({ taskId }) => {
  // Hooks for API mutations/queries
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const { mutateAsync: createActivityAsync } = useCreateActivity(() => {});
  const { data: taskDetail, isLoading: taskLoading } = useTask(taskId);
  const router = useRouter();

  // Local state
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
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Columns shown by default (now including "remaining")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "no",
    "activity_name",
    "priority",
    "unit",
    "quantity",
    "start_date",
    "end_date",
    "duration",
    "remaining",
    "resource",
    "status",
    "actions",
  ]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Refs to detect outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus if clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownActivityId(null);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Download columns setup, including "Remaining"
  const downloadColumns: Column<Activity>[] = [
    { header: "Activity", accessor: "activity_name" },
    { header: "Unit", accessor: "unit" },
    { header: "Quantity", accessor: (row) => row.quantity },
    { header: "Start Date", accessor: (row) => formatDate(row.start_date) },
    { header: "End Date", accessor: (row) => formatDate(row.end_date) },
    {
      header: "Duration",
      accessor: (row) => getDateDuration(row.start_date, row.end_date),
    },
    {
      header: "Remaining",
      accessor: (row) =>
        getDateDuration(new Date().toISOString(), row.end_date),
    },
    { header: "Resource", accessor: (row) => row.resource?.toString() ?? "" },
  ];

  // Label mapping for column customization
  const columnOptions: Record<string, string> = {
    no: "No",
    activity_name: "Activity",
    priority: "Priority",
    unit: "Unit",
    quantity: "QTY",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    remaining: "Remaining",
    resource: "Resource",
    status: "Status",
    actions: "Actions",
  };

  // Early returns
  if (taskLoading) return <div className="p-4">Loading...</div>;
  if (!taskDetail) return <div className="p-4">Task not found</div>;

  // Filter activities by search term
  const activities = taskDetail.activities as Activity[];

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

  // Filtered list
  const filteredActivities = activities.filter((act) => {
    let matches = true;
    if (filterValues.activity_name) {
      matches =
        matches &&
        act.activity_name
          .toLowerCase()
          .includes((filterValues.activity_name as string).toLowerCase());
    }
    if (filterValues.priority) {
      matches = matches && act.priority === filterValues.priority;
    }
    if (filterValues.status) {
      matches = matches && act.status === filterValues.status;
    }

    return matches;
  });

  const taskName = taskDetail.task_name || "Unknown Task";
  const totalActivities = filteredActivities.length;

  // Handlers
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleDeleteClick = (id: string) => {
    setSelectedActivityId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedActivityId) deleteActivity(selectedActivityId);
    setIsDeleteModalOpen(false);
  };

  const handleView = (id: string) => router.push(`/activities/${id}`);

  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
  };

  const handleManageSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowManageForm(false);
  };

  // Activity import configuration
  const importColumns: ImportColumn<CreateActivityInput>[] = [
    { header: "Activity", accessor: "activity_name", type: "string" },
    { header: "Priority", accessor: "priority", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Quantity", accessor: "quantity", type: "number" },
    { header: "Start Date", accessor: "start_date", type: "date" },
    { header: "End Date", accessor: "end_date", type: "date" },
    { header: "Status", accessor: "status", type: "string" },
  ];

  const requiredAccessors: (keyof CreateActivityInput)[] = [
    "activity_name",
    "priority",
    "unit",
    "quantity",
    "start_date",
    "end_date",
    "status",
  ];

  const handleActivityImport = async (data: CreateActivityInput[]) => {
    try {
      // Validate priority and status values
      const validPriorities = ["Critical", "High", "Medium", "Low"];
      const validStatuses = [
        "Not Started",
        "Started",
        "InProgress",
        "Canceled",
        "Onhold",
        "Completed",
      ];

      for (let i = 0; i < data.length; i++) {
        const activity = data[i];
        if (!validPriorities.includes(activity.priority)) {
          toast.error(
            `Invalid priority in row ${
              i + 2
            }. Must be one of: ${validPriorities.join(", ")}`
          );
          return;
        }
        if (!validStatuses.includes(activity.status)) {
          toast.error(
            `Invalid status in row ${
              i + 2
            }. Must be one of: ${validStatuses.join(", ")}`
          );
          return;
        }
        // Provide default for description and set task_id
        activity.task_id = taskId;
        activity.description = activity.description || "Imported activity";
      }

      await Promise.all(data.map((activity) => createActivityAsync(activity)));
      toast.success("Activities imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating activities");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-4">
      <style>
        {`
          .truncate-ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        `}
      </style>
      {/* Downloads & Search */}
      <div className="flex justify-end mb-4">
        <GenericImport<CreateActivityInput>
          expectedColumns={importColumns}
          requiredAccessors={requiredAccessors}
          onImport={handleActivityImport}
          title="Activities"
          onError={handleError}
        />
      </div>
      <GenericDownloads
        data={filteredActivities}
        title="Activities"
        columns={downloadColumns}
      />
      <div className="flex items-center justify-between">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
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
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          Task: <span className="font-normal ml-1">{taskName}</span>
        </div>
        <div className="font-semibold">
          Total Activities:{" "}
          <span className="font-normal ml-1">{totalActivities}</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800"
        >
          Create Activity
        </button>
      </div>

      {/* Modals */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ActivityForm
              onClose={() => setShowForm(false)}
              defaultTaskId={taskId}
            />
          </div>
        </div>
      )}
      {showEditForm && activityToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditActivityForm
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditSubmit}
              activity={activityToEdit}
            />
          </div>
        </div>
      )}
      {showManageForm && activityToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ManageActivityForm
              onClose={() => setShowManageForm(false)}
              onSubmit={handleManageSubmit}
              activity={activityToEdit}
            />
          </div>
        </div>
      )}

      {/* Activity Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto">
          <thead className="bg-emerald-700 text-gray-200">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-16 truncate-ellipsis">
                  No
                </th>
              )}
              {selectedColumns.includes("activity_name") && (
                <th className="border px-4 py-2 text-left text-sm font-medium min-w-[200px]">
                  Activity
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                  Priority
                </th>
              )}
              {selectedColumns.includes("unit") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-20 truncate-ellipsis">
                  Unit
                </th>
              )}
              {selectedColumns.includes("quantity") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-20 truncate-ellipsis">
                  QTY
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-28 truncate-ellipsis">
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-28 truncate-ellipsis">
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                  Duration
                </th>
              )}
              {selectedColumns.includes("remaining") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                  Remaining
                </th>
              )}
              {selectedColumns.includes("resource") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                  Resource
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-28 truncate-ellipsis">
                  Status
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border px-4 py-2 text-left text-sm font-medium w-32 truncate-ellipsis">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => {
                const remainingDays = getDateDuration(
                  new Date().toISOString(),
                  activity.end_date
                );

                return (
                  <tr key={activity.id} className="hover:bg-gray-50 relative">
                    {selectedColumns.includes("no") && (
                      <td className="border px-4 py-2 w-16 truncate-ellipsis">
                        {index + 1}
                      </td>
                    )}
                    {selectedColumns.includes("activity_name") && (
                      <td className="border px-4 py-2 font-medium min-w-[200px]">
                        <Link href={`/activities/${activity.id}`}>
                          {activity.activity_name}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("priority") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            priorityBadgeClasses[activity.priority]
                          }`}
                        >
                          {activity.priority}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("unit") && (
                      <td className="border px-4 py-2 w-20 truncate-ellipsis">
                        {activity.unit}
                      </td>
                    )}
                    {selectedColumns.includes("quantity") && (
                      <td className="border px-4 py-2 w-20 truncate-ellipsis">
                        {activity.quantity}
                      </td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
                        {formatDate(activity.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
                        {formatDate(activity.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {getDateDuration(
                          activity.start_date,
                          activity.end_date
                        )}
                      </td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {remainingDays}
                      </td>
                    )}
                    {selectedColumns.includes("resource") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        <Link
                          href={`/resources/${activity.id}`}
                          className="text-emerald-700 hover:underline"
                        >
                          Request
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            statusBadgeClasses[activity.status]
                          }`}
                        >
                          {activity.status}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("actions") && (
                      <td className="border px-4 py-2 w-32">
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
                                  handleView(activity.id);
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
                                    assignedUsers: activity.assignedUsers?.map(
                                      (u) => u.id
                                    ),
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
                                  handleDeleteClick(activity.id);
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
                                    assignedUsers: activity.assignedUsers?.map(
                                      (u) => u.id
                                    ),
                                  });
                                  setShowManageForm(true);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                Manage
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="border px-4 py-2 text-center text-gray-500"
                >
                  No activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this activity?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default ActivityTable;
