"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import { Activity, UpdateActivityInput } from "@/types/activity";
import ActivityForm from "../forms/ActivityForm";
import EditActivityForm from "../forms/EditActivityForm";
import ManageActivityForm from "../forms/ManageActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteActivity, useUpdateActivity } from "@/hooks/useActivities";
import Link from "next/link";
import { formatDate, getDateDuration } from "@/utils/helper";
import GenericDownloads, { Column } from "../common/GenericDownloads";
import SearchInput from "../ui/SearchInput";

interface ActivityTableProps {
  taskId: string;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ taskId }) => {
  // Hooks for API mutations/queries
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
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
  const [searchTerm, setSearchTerm] = useState("");

  // Columns shown by default (now including "remaining")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "no",
    "activity_name",
    "unit",
    "quantity",
    "start_date",
    "end_date",
    "duration",
    "remaining",
    "resource",
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
    unit: "Unit",
    quantity: "QTY",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    remaining: "Remaining",
    resource: "Resource",
    actions: "Actions",
  };

  // Early returns
  if (taskLoading) return <div className="p-4">Loading...</div>;
  if (!taskDetail) return <div className="p-4">Task not found</div>;

  // Filter activities by search term
  const activities = taskDetail.activities as Activity[];
  const filteredActivities = activities.filter(
    (a) =>
      a.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded space-y-4">
      {/* Downloads & Search */}
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
        <SearchInput
          placeholder="Search activities..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
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
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-emerald-700 text-gray-200">
            <tr>
              {selectedColumns.includes("no") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  No
                </th>
              )}
              {selectedColumns.includes("activity_name") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Activity
                </th>
              )}
              {selectedColumns.includes("unit") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Unit
                </th>
              )}
              {selectedColumns.includes("quantity") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  QTY
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Duration
                </th>
              )}
              {selectedColumns.includes("remaining") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Remaining
                </th>
              )}
              {selectedColumns.includes("resource") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Resource
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border px-4 py-2 text-left text-sm font-medium">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => {
                // Compute “Remaining” as days from today until end_date
                const remainingDays = getDateDuration(
                  new Date().toISOString(),
                  activity.end_date
                );

                return (
                  <tr key={activity.id} className="hover:bg-gray-50 relative">
                    {selectedColumns.includes("no") && (
                      <td className="border px-4 py-2">{index + 1}</td>
                    )}
                    {selectedColumns.includes("activity_name") && (
                      <td className="border px-4 py-2 font-medium">
                        <Link href={`/activities/${activity.id}`}>
                          {activity.activity_name}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("unit") && (
                      <td className="border px-4 py-2">{activity.unit}</td>
                    )}
                    {selectedColumns.includes("quantity") && (
                      <td className="border px-4 py-2">{activity.quantity}</td>
                    )}
                    {selectedColumns.includes("start_date") && (
                      <td className="border px-4 py-2">
                        {formatDate(activity.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border px-4 py-2">
                        {formatDate(activity.end_date)}
                      </td>
                    )}
                    {selectedColumns.includes("duration") && (
                      <td className="border px-4 py-2">
                        {getDateDuration(
                          activity.start_date,
                          activity.end_date
                        )}
                      </td>
                    )}
                    {selectedColumns.includes("remaining") && (
                      <td className="border px-4 py-2">{remainingDays}</td>
                    )}
                    {selectedColumns.includes("resource") && (
                      <td className="border px-4 py-2">
                        <Link
                          href={`/resources/${activity.id}`}
                          className="text-emerald-700 hover:underline"
                        >
                          Request
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("actions") && (
                      <td className="border px-4 py-2 relative">
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
