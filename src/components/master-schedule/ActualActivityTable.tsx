"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActivities,
  useDeleteActivity,
  useUpdateActivity,
} from "@/hooks/useActivities";
import { UpdateActivityInput, Activity } from "@/types/activity";
import { formatDate, getDuration } from "@/utils/helper";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../ui/ConfirmModal";

import Link from "next/link";

interface ResourceCosts {
  labor: { ot: number; dt: number };
  material: { ot: number; dt: number };
  equipment: { ot: number; dt: number };
  total: number;
}

interface ExtendedActivity extends Activity {
  resourceCosts: ResourceCosts;
  overUnder: string;
}

interface ActualActivityTableProps {
  taskId: string;
}

const ActualActivityTable: React.FC<ActualActivityTableProps> = ({
  taskId,
}) => {
  // Fetch all activities from the hook
  const {
    data: activities,
    isLoading: loadingAct,
    error: errorAct,
  } = useActivities();

  // Mutations for deleting/updating
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();

  const router = useRouter();

  // Column customization
  const columnOptions: Record<string, string> = {
    id: "ID",
    activity_name: "Activities",
    unit: "Unit",
    quantity: "Qty",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    progress: "Progress",
    status: "Status",
    labor: "Labor",
    material: "Material",
    equipment: "Equipment",
    total: "Total",
    overUnder: "Over/Under",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit/Delete modal state
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  // Close column menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter fetched activities to only those matching the given taskId
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter((act) => act.task_id === taskId);
  }, [activities, taskId]);

  // Extend each activity with calculated resource costs and over/under
  const extendedActivities: ExtendedActivity[] = useMemo(() => {
    return filteredActivities.map((act) => {
      // Using quantity as a placeholder to compute OT/DT; adjust logic as needed
      const count = act.quantity ?? 0;
      const laborOt = count * 453;
      const laborDt = 0;
      const materialOt = count * 1000;
      const materialDt = 0;
      const equipmentOt = count * 500;
      const equipmentDt = 0;
      const total = laborOt + materialOt + equipmentOt;
      return {
        ...act,
        resourceCosts: {
          labor: { ot: laborOt, dt: laborDt },
          material: { ot: materialOt, dt: materialDt },
          equipment: { ot: equipmentOt, dt: equipmentDt },
          total,
        },
        overUnder: "$0", // Placeholder; replace with real over/under logic if needed
      };
    });
  }, [filteredActivities]);

  // Toggle a column on/off
  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setSelectedActivityId(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (selectedActivityId) deleteActivity(selectedActivityId);
    setIsDeleteModalOpen(false);
  };

  // Handle “Update” button click: open EditActivityForm
  const handleEditClick = (item: ExtendedActivity) => {
    setActivityToEdit({
      ...item,
      assignedUsers: item.assignedUsers?.map((u) => u.id) || [],
    });
    setShowEditForm(true);
  };

  // Handle submit from EditActivityForm
  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
  };

  // Count total columns (for colspan when “no data”)
  const resourceCols = ["labor", "material", "equipment"];
  const totalColumns = selectedColumns.reduce((acc, col) => {
    if (resourceCols.includes(col)) {
      return acc + 2; // OT + DT subcolumns
    } else {
      return acc + 1;
    }
  }, 0);

  // Render loading / error states
  if (loadingAct) return <div className="p-4">Loading activities...</div>;
  if (errorAct)
    return <div className="p-4 text-red-600">Error loading activities.</div>;

  return (
    <div>
      {/* Edit Modal */}
      {showEditForm && activityToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditActivityForm
              activity={activityToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {/* Column Customization Button */}
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
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actual Activity Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse border border-gray-300">
          <thead className="bg-cyan-700 text-gray-50">
            <tr>
              {selectedColumns.includes("id") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  ID
                </th>
              )}
              {selectedColumns.includes("activity_name") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Activities
                </th>
              )}
              {selectedColumns.includes("unit") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Unit
                </th>
              )}
              {selectedColumns.includes("quantity") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Qty
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Start Date
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  End Date
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Duration
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Progress
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Status
                </th>
              )}
              {selectedColumns.includes("labor") && (
                <th
                  colSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap"
                >
                  Labor
                </th>
              )}
              {selectedColumns.includes("material") && (
                <th
                  colSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap"
                >
                  Material
                </th>
              )}
              {selectedColumns.includes("equipment") && (
                <th
                  colSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap"
                >
                  Equipment
                </th>
              )}
              {selectedColumns.includes("total") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap"
                >
                  Total
                </th>
              )}
              {selectedColumns.includes("overUnder") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Over/Under
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
                >
                  Actions
                </th>
              )}
            </tr>
            <tr>
              {selectedColumns.includes("labor") && (
                <>
                  <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                    OT
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                    DT
                  </th>
                </>
              )}
              {selectedColumns.includes("material") && (
                <>
                  <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                    OT
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                    DT
                  </th>
                </>
              )}
              {selectedColumns.includes("equipment") && (
                <>
                  <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                    OT
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                    DT
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {extendedActivities.length > 0 ? (
              extendedActivities.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {selectedColumns.flatMap((col) => {
                    if (col === "labor") {
                      return [
                        <td
                          key={`${item.id}-labor-ot`}
                          className="border border-gray-300 px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          {item.resourceCosts.labor.ot}
                        </td>,
                        <td
                          key={`${item.id}-labor-dt`}
                          className="border border-gray-300 px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          {item.resourceCosts.labor.dt}
                        </td>,
                      ];
                    } else if (col === "material") {
                      return [
                        <td
                          key={`${item.id}-material-ot`}
                          className="border border-gray-300 px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          {item.resourceCosts.material.ot}
                        </td>,
                        <td
                          key={`${item.id}-material-dt`}
                          className="border border-gray-300 px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          {item.resourceCosts.material.dt}
                        </td>,
                      ];
                    } else if (col === "equipment") {
                      return [
                        <td
                          key={`${item.id}-equipment-ot`}
                          className="border border-gray-300 px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          {item.resourceCosts.equipment.ot}
                        </td>,
                        <td
                          key={`${item.id}-equipment-dt`}
                          className="border border-gray-300 px-4 py-2 text-sm text-center whitespace-nowrap"
                        >
                          {item.resourceCosts.equipment.dt}
                        </td>,
                      ];
                    } else {
                      return [
                        <td
                          key={`${item.id}-${col}`}
                          className="border border-gray-300 px-4 py-2 text-sm whitespace-nowrap"
                        >
                          {col === "id" &&
                            `RC${String(idx + 1).padStart(3, "0")}`}
                          {col === "activity_name" && (
                            <Link
                              href={`/activities/${item.id}`}
                              className="hover:underline"
                            >
                              {item.activity_name}
                            </Link>
                          )}
                          {col === "unit" && item.unit}
                          {col === "quantity" && (item.quantity ?? "–")}
                          {col === "start_date" && formatDate(item.start_date)}
                          {col === "end_date" && formatDate(item.end_date)}
                          {col === "duration" &&
                            getDuration(item.start_date, item.end_date)}
                          {col === "progress" && (
                            <div className="relative h-5 bg-gray-200 rounded">
                              <div
                                className="absolute h-full bg-blue-600 rounded"
                                style={{ width: `${item.progress}%` }}
                              >
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                  {item.progress}%
                                </span>
                              </div>
                            </div>
                          )}
                          {col === "status" && item.status}
                          {col === "total" && item.resourceCosts.total}
                          {col === "overUnder" && item.overUnder}
                          {col === "actions" && (
                            <Menu
                              as="div"
                              className="relative inline-block text-left"
                            >
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
                                      onClick={() =>
                                        router.push(`/activities/${item.id}`)
                                      }
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
                                      onClick={() => handleEditClick(item)}
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
                                      onClick={() => handleDeleteClick(item.id)}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </MenuItem>
                              </MenuItems>
                            </Menu>
                          )}
                        </td>,
                      ];
                    }
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                >
                  No activities found for this task.
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
          onConfirm={confirmDelete}
        />
      )}

      {/* Footer (row count) */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-gray-700">
          Showing {extendedActivities.length} rows
        </span>
      </div>
    </div>
  );
};

export default ActualActivityTable;
