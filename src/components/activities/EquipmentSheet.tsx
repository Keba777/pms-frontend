import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import {
  useEquipmentTimesheets,
  useCreateEquipmentTimesheet,
  useUpdateEquipmentTimesheet,
  useDeleteEquipmentTimesheet,
} from "@/hooks/useTimesheets";
import { useEquipments } from "@/hooks/useEquipments";
import {
  createEquipmentTimesheetInput,
  updateEquipmentTimesheetInput,
  EquipmentTimesheet,
} from "@/types/timesheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ConfirmModal from "../common/ui/ConfirmModal";
import CreateEquipmentTimesheetForm from "../forms/timesheet/CreateEquipmentTimesheetForm";
import EditEquipmentTimesheetForm from "../forms/timesheet/EditEquipmentTimesheetForm";
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";

export const EquipmentSheet: React.FC = () => {
  const { useEthiopianDate } = useSettingsStore();
  const {
    data: equipmentTimesheets,
    isLoading: isLoadingTimes,
    isError: isErrorTimes,
    error: timesError,
  } = useEquipmentTimesheets();

  const {
    data: equipment,
    isLoading: isLoadingEquipment,
    isError: isErrorEquipment,
    error: equipmentError,
  } = useEquipments();

  const createMutation = useCreateEquipmentTimesheet();
  const updateMutation = useUpdateEquipmentTimesheet();
  const deleteMutation = useDeleteEquipmentTimesheet();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedItem, setSelectedItem] = useState<EquipmentTimesheet | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const columns = [
    "#",
    "Equipment",
    "Date",
    "Morning In",
    "Morning Out",
    "Morning Hrs",
    "Break Time",
    "Afternoon In",
    "Afternoon Out",
    "Afternoon Hrs",
    "OT",
    // "DT",
    "Rate",
    "Total Cost",
    "Status",
  ];

  const calculateHours = (inTime: string, outTime: string): number => {
    if (!inTime || !outTime) return 0;
    const [inHour, inMinute] = inTime.split(":").map(Number);
    const [outHour, outMinute] = outTime.split(":").map(Number);
    const inDate = new Date(0, 0, 0, inHour, inMinute);
    const outDate = new Date(0, 0, 0, outHour, outMinute);
    const diffMs = outDate.getTime() - inDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : 0;
  };

  const calculateBreak = (morningOut: string, afternoonIn: string): number => {
    if (!morningOut || !afternoonIn) return 0;
    return calculateHours(morningOut, afternoonIn);
  };

  const handleOpenModal = (
    mode: "create" | "edit" | "view",
    item?: EquipmentTimesheet
  ) => {
    setModalMode(mode);
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const handleDeleteClick = (item: EquipmentTimesheet) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem?.id) {
      deleteMutation.mutate(selectedItem.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
        },
      });
    }
  };

  const handleFormSubmit = (
    data: createEquipmentTimesheetInput | updateEquipmentTimesheetInput
  ) => {
    const mornHrs = calculateHours(data.morningIn ?? "", data.morningOut ?? "");
    const aftHrs = calculateHours(
      data.afternoonIn ?? "",
      data.afternoonOut ?? ""
    );
    const breakTime = calculateBreak(
      data.morningOut ?? "",
      data.afternoonIn ?? ""
    );
    const ot = Number(data.ot) || 0;
    const dt = Number(data.dt) || 0;
    const rate = Number(data.rate) || 0;
    const totalCost = (mornHrs + aftHrs) * rate + ot;

    const input = {
      equipmentId: data.equipmentId,
      date: data.date ? new Date(data.date) : new Date(),
      morningIn: data.morningIn,
      morningOut: data.morningOut,
      mornHrs,
      bt: breakTime,
      afternoonIn: data.afternoonIn,
      afternoonOut: data.afternoonOut,
      aftHrs,
      ot,
      dt,
      rate,
      totalPay: totalCost,
      status: data.status,
    };

    if (modalMode === "create") {
      createMutation.mutate(input as createEquipmentTimesheetInput, {
        onSuccess: () => setShowModal(false),
      });
    } else if (modalMode === "edit" && selectedItem?.id) {
      updateMutation.mutate(
        { ...input, id: selectedItem.id } as updateEquipmentTimesheetInput & {
          id: string;
        },
        {
          onSuccess: () => setShowModal(false),
        }
      );
    }
  };

  if (isLoadingTimes || isLoadingEquipment) {
    return <p className="p-4">Loading equipment timesheets or equipment...</p>;
  }

  if (isErrorTimes) {
    return (
      <p className="p-4 text-red-600">
        Error loading equipment timesheets: {timesError?.message}
      </p>
    );
  }

  if (isErrorEquipment) {
    return (
      <p className="p-4 text-red-600">
        Error loading equipment: {equipmentError?.message}
      </p>
    );
  }

  return (
    <div>
      <Button
        onClick={() => handleOpenModal("create")}
        className="mb-2 bg-cyan-700 text-white"
      >
        Add New
      </Button>

      <div className="overflow-x-auto">
        <Table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto">
          <TableHeader className="bg-cyan-700">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="text-white px-5 py-3 text-left text-sm font-medium truncate"
                >
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-white px-5 py-3 text-left text-sm font-medium w-32 truncate">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {equipmentTimesheets?.map((row, idx) => {
              const equipmentName =
                equipment?.find((e) => e.id === row.equipmentId)?.item ||
                row.equipmentId;

              return (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  <TableCell className="px-5 py-2">{idx + 1}</TableCell>
                  <TableCell className="px-5 py-2">{equipmentName}</TableCell>
                  <TableCell className="px-5 py-2">
                    {format(row.date, useEthiopianDate)}
                  </TableCell>
                  <TableCell className="px-5 py-2">{row.morningIn}</TableCell>
                  <TableCell className="px-5 py-2">{row.morningOut}</TableCell>
                  <TableCell className="px-5 py-2">
                    {row.mornHrs.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5 py-2">
                    {row.bt.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5 py-2">{row.afternoonIn}</TableCell>
                  <TableCell className="px-5 py-2">
                    {row.afternoonOut}
                  </TableCell>
                  <TableCell className="px-5 py-2">
                    {row.aftHrs.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5 py-2">
                    {row.ot.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5 py-2">
                    {row.rate.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5 py-2">
                    {row.totalPay.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-5 py-2">{row.status}</TableCell>
                  <TableCell className="px-5 py-2 w-32">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 w-full">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute left-0 mt-2 w-40 bg-white border divide-y divide-gray-100 rounded-md shadow-lg z-50">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleOpenModal("view", row)}
                              className={`w-full text-left px-3 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              View
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleOpenModal("edit", row)}
                              className={`w-full text-left px-3 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              Edit
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleDeleteClick(row)}
                              className={`w-full text-left px-3 py-2 text-sm text-red-600 ${
                                active ? "bg-gray-100" : ""
                              }`}
                            >
                              Delete
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            {modalMode === "create" ? (
              <CreateEquipmentTimesheetForm
                onClose={() => setShowModal(false)}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <EditEquipmentTimesheetForm
                onClose={() => setShowModal(false)}
                mode={modalMode}
                initialData={selectedItem || undefined}
                onSubmit={handleFormSubmit}
              />
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isVisible={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this equipment timesheet?"
        showInput={false}
        confirmText="DELETE"
        inputPlaceholder='Type "DELETE" to confirm'
        confirmButtonText="Delete"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
