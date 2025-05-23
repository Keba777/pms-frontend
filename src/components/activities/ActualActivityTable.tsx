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
import { useLabors } from "@/hooks/useLabors";
import { useMaterials } from "@/hooks/useMaterials";
import { useEquipments } from "@/hooks/useEquipments";
import { UpdateActivityInput, Activity } from "@/types/activity";
import { formatDate, getDuration } from "@/utils/helper";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../ui/ConfirmModal";
import ActivityTableSkeleton from "./ActivityTableSkeleton";
import Link from "next/link";

interface ExtendedActivity extends Activity {
  resourceCosts: {
    labor: number;
    material: number;
    equipment: number;
    total: number;
  };
  overUnder: string;
}

const ActualActivityTable: React.FC = () => {
  const {
    data: activities,
    isLoading: loadingAct,
    error: errorAct,
  } = useActivities();
  const { data: labors } = useLabors();
  const { data: materials } = useMaterials();
  const { data: equipments } = useEquipments();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();

  // Column customization setup
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

  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  const router = useRouter();

  if (loadingAct) return <ActivityTableSkeleton />;
  if (errorAct) return <div>Error fetching activities.</div>;

  const extendedActivities: ExtendedActivity[] = useMemo(() => {
    if (!activities) return [];
    return activities.map((act) => {
      const laborCost = 0;
      const materialCost = 0;
      const equipmentCost = 0;
      const total = laborCost + materialCost + equipmentCost;
      const overUnder = "$0";
      return {
        ...act,
        resourceCosts: {
          labor: laborCost,
          material: materialCost,
          equipment: equipmentCost,
          total,
        },
        overUnder,
      };
    });
  }, [activities, labors, materials, equipments]);

  const handleDeleteClick = (id: string) => {
    setSelectedActivityId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedActivityId) deleteActivity(selectedActivityId);
    setIsDeleteModalOpen(false);
  };

  const handleEditClick = (item: ExtendedActivity) => {
    setActivityToEdit({
      ...item,
      assignedUsers: item.assignedUsers?.map((u) => u.id) || [],
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
  };

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

      {/* Customize Columns Button */}
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

      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse border border-gray-300">
          <thead className="bg-cyan-700 text-gray-50">
            <tr>
              {selectedColumns.includes("id") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.id}
                </th>
              )}
              {selectedColumns.includes("activity_name") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.activity_name}
                </th>
              )}
              {selectedColumns.includes("unit") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.unit}
                </th>
              )}
              {selectedColumns.includes("quantity") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.quantity}
                </th>
              )}
              {selectedColumns.includes("start_date") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.start_date}
                </th>
              )}
              {selectedColumns.includes("end_date") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.end_date}
                </th>
              )}
              {selectedColumns.includes("duration") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.duration}
                </th>
              )}
              {selectedColumns.includes("progress") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.progress}
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.status}
                </th>
              )}
              {selectedColumns.includes("labor") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                  {columnOptions.labor}
                </th>
              )}
              {selectedColumns.includes("material") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                  {columnOptions.material}
                </th>
              )}
              {selectedColumns.includes("equipment") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                  {columnOptions.equipment}
                </th>
              )}
              {selectedColumns.includes("total") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap">
                  {columnOptions.total}
                </th>
              )}
              {selectedColumns.includes("overUnder") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.overUnder}
                </th>
              )}
              {selectedColumns.includes("actions") && (
                <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap">
                  {columnOptions.actions}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {extendedActivities.length > 0 ? (
              extendedActivities.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {`RC${String(index + 1).padStart(3, "0")}`}
                    </td>
                  )}
                  {selectedColumns.includes("activity_name") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/activities/${item.id}`}
                        className="hover:underline"
                      >
                        {item.activity_name}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {item.unit}
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {item.quantity ?? "–"}
                    </td>
                  )}
                  {selectedColumns.includes("start_date") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {formatDate(item.start_date)}
                    </td>
                  )}
                  {selectedColumns.includes("end_date") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {formatDate(item.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("duration") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {getDuration(item.start_date, item.end_date)}
                    </td>
                  )}
                  {selectedColumns.includes("progress") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
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
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {item.status}
                    </td>
                  )}
                  {selectedColumns.includes("labor") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                      {item.resourceCosts.labor}
                    </td>
                  )}
                  {selectedColumns.includes("material") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                      {item.resourceCosts.material}
                    </td>
                  )}
                  {selectedColumns.includes("equipment") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                      {item.resourceCosts.equipment}
                    </td>
                  )}
                  {selectedColumns.includes("total") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                      {item.resourceCosts.total}
                    </td>
                  )}
                  {selectedColumns.includes("overUnder") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                      {item.overUnder}
                    </td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
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
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                >
                  No activities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
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

      {/* Footer */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-gray-700">
          Showing {extendedActivities.length} rows
        </span>
      </div>
    </div>
  );
};

export default ActualActivityTable;
