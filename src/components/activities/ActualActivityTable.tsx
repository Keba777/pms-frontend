"use client";

import React, { useState, useMemo } from "react";
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
import { UpdateActivityInput } from "@/types/activity";
import { Activity } from "@/types/activity";
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

      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse border border-gray-300">
          <thead className="bg-cyan-700 text-gray-50">
            <tr>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                ID
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Activities
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Unit
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Qty
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Start Date
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                End Date
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Duration
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Progress
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Status
              </th>
              <th
                colSpan={4}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap"
              >
                Resource Costs
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Over/Under
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
              >
                Actions
              </th>
            </tr>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
                Labor
              </th>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
                Material
              </th>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
                Equipment
              </th>
              <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {extendedActivities.length > 0 ? (
              extendedActivities.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">{`RC${String(
                    index + 1
                  ).padStart(3, "0")}`}</td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    <Link
                      href={`/activities/${item.id}`}
                      className="hover:underline font-medium"
                    >
                      {item.activity_name}
                    </Link>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {item.unit}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {item.quantity ?? "–"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {formatDate(item.start_date)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {formatDate(item.end_date)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {getDuration(item.start_date, item.end_date)}
                  </td>
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
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {item.status}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                    {item.resourceCosts.labor}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                    {item.resourceCosts.material}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                    {item.resourceCosts.equipment}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                    {item.resourceCosts.total}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                    {item.overUnder}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
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
                              onClick={() => {
                                setActivityToEdit({
                                  ...item,
                                  assignedUsers:
                                    item.assignedUsers?.map((u) => u.id) || [],
                                });
                                setShowEditForm(true);
                              }}
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={14}
                  className="border border-gray-300 px-4 py-2 text-center text-sm"
                >
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
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-gray-700">
          Showing {extendedActivities.length} rows
        </span>
      </div>
    </div>
  );
};

export default ActualActivityTable;
