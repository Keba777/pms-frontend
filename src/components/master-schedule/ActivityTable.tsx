"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTask } from "@/hooks/useTasks";
import { Activity, UpdateActivityInput } from "@/types/activity";
import ActivityForm from "../forms/ActivityForm";
import EditActivityForm from "../forms/EditActivityForm";
import ManageActivityForm from "../forms/ManageActivityForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { useRouter } from "next/navigation";
import { useDeleteActivity, useUpdateActivity } from "@/hooks/useActivities";
import Link from "next/link";
import { getDateDuration } from "@/utils/helper";
import { formatDate as format } from "@/utils/dateUtils";
import { User } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";

interface ActivityTableProps {
  taskId: string;
  filteredActivities: Activity[];
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

const ActivityTable: React.FC<ActivityTableProps> = ({
  taskId,
  filteredActivities,
}) => {

  // Hooks for API mutations/queries
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();

  const { data: taskDetail, isLoading: taskLoading } = useTask(taskId);
  const { data: users } = useUsers();
  const router = useRouter();

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showManageForm, setShowManageForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<Activity | null>(null);
  const [dropdownActivityId, setDropdownActivityId] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

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
    "materials",
    "equipments",
    "labors",
    "request",
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
    materials: "Materials",
    equipments: "Equipments",
    labors: "Labors",
    request: "Request Resource",
    status: "Status",
    actions: "Actions",
  };

  // Early returns
  if (taskLoading) return <div className="p-4">Loading...</div>;
  if (!taskDetail) return <div className="p-4">Task not found</div>;

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

  const handleEditSubmit = (data: UpdateActivityInput | FormData) => {
    updateActivity(data as any); // Cast to any if inference fails, or just pass it if types align
    setShowEditForm(false);
  };

  const handleManageSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowManageForm(false);
  };

  const totalActivities = filteredActivities?.length;

  const resourceColSpan = ["materials", "equipments", "labors"].reduce(
    (count, col) => count + (selectedColumns.includes(col) ? 1 : 0),
    0
  );
  const showResourceCost = resourceColSpan > 0;

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
      {/* <div className="flex justify-end mb-4">
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
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div> */}

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div ref={menuRef} className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowColumnMenu((v) => !v)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-sm font-bold text-sm"
            >
              Customize Columns <ChevronDown className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Visible Columns</span>
                </div>
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key)}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-bold">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="text-xs font-black uppercase text-gray-400 tracking-wider bg-white px-3 py-2 rounded-lg border border-gray-100">
              Total Activities: <span className="text-cyan-800 ml-1">{totalActivities}</span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-all font-black uppercase text-xs tracking-widest shadow-sm"
            >
              Create Activity
            </button>
          </div>
        </div>
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
              users={users}
            />
          </div>
        </div>
      )}
      {showManageForm && activityToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Removed onSubmit prop because ManageActivityForm's prop type does not include it */}
            <ManageActivityForm
              onClose={() => setShowManageForm(false)}
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
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-16 truncate-ellipsis"
                >
                  No
                </th>
              )}
              {selectedColumns.includes("activity_name") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium min-w-[200px]"
                >
                  Activity
                </th>
              )}
              {selectedColumns.includes("priority") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis"
                >
                  Priority
                </th>
              )}
              {selectedColumns.includes("unit") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-20 truncate-ellipsis"
                >
                  Unit
                </th>
              )}
              {selectedColumns.includes("quantity") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-20 truncate-ellipsis"
                >
                  QTY
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-28 truncate-ellipsis"
                >
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-28 truncate-ellipsis"
                >
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis"
                >
                  Duration
                </th>
              )}
              {selectedColumns.includes("remaining") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis"
                >
                  Remaining
                </th>
              )}
              {showResourceCost && (
                <th
                  colSpan={resourceColSpan}
                  className="border border-emerald-600 px-4 py-2 text-center text-sm font-medium"
                >
                  Resource Cost
                </th>
              )}
              {selectedColumns.includes("request") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis"
                >
                  Request Resource
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-28 truncate-ellipsis"
                >
                  Status
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th
                  rowSpan={2}
                  className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-32 truncate-ellipsis"
                >
                  Actions
                </th>
              )}
            </tr>
            {showResourceCost && (
              <tr>
                {selectedColumns.includes("materials") && (
                  <th className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                    Materials
                  </th>
                )}
                {selectedColumns.includes("equipments") && (
                  <th className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                    Equipments
                  </th>
                )}
                {selectedColumns.includes("labors") && (
                  <th className="border border-emerald-600 px-4 py-2 text-left text-sm font-medium w-24 truncate-ellipsis">
                    Labors
                  </th>
                )}
              </tr>
            )}
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
                          className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[activity.priority]
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
                        {format(activity.start_date)}
                      </td>
                    )}
                    {selectedColumns.includes("end_date") && (
                      <td className="border px-4 py-2 w-28 truncate-ellipsis">
                        {format(activity.end_date)}
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
                    {selectedColumns.includes("materials") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {activity.requests?.reduce(
                          (sum, req) => sum + (req.materialCount || 0),
                          0
                        ) || 0}
                      </td>
                    )}
                    {selectedColumns.includes("equipments") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {activity.requests?.reduce(
                          (sum, req) => sum + (req.equipmentCount || 0),
                          0
                        ) || 0}
                      </td>
                    )}
                    {selectedColumns.includes("labors") && (
                      <td className="border px-4 py-2 w-24 truncate-ellipsis">
                        {activity.requests?.reduce(
                          (sum, req) => sum + (req.laborCount || 0),
                          0
                        ) || 0}
                      </td>
                    )}
                    {selectedColumns.includes("request") && (
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
                          className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[activity.status]
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
                                  setActivityToEdit(activity);
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
                                  setActivityToEdit(activity);
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
