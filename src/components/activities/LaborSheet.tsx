import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import {
  useLaborTimesheets,
  useCreateLaborTimesheet,
  useUpdateLaborTimesheet,
  useDeleteLaborTimesheet,
} from "@/hooks/useTimesheets";
import { useUsers } from "@/hooks/useUsers";
import {
  createLaborTimesheetInput,
  updateLaborTimesheetInput,
  LaborTimesheet,
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
import CreateLaborTimesheetForm from "../forms/timesheet/CreateLaborTimesheetForm";
import EditLaborTimesheetForm from "../forms/timesheet/EditLaborTimesheetForm";
import { formatDate as format } from "@/utils/dateUtils";

export const LaborSheet: React.FC = () => {
  const {
    data: laborTimesheets,
    isLoading: isLoadingTimes,
    isError: isErrorTimes,
    error: timesError,
  } = useLaborTimesheets();

  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError,
  } = useUsers();

  const createMutation = useCreateLaborTimesheet();
  const updateMutation = useUpdateLaborTimesheet();
  const deleteMutation = useDeleteLaborTimesheet();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedItem, setSelectedItem] = useState<LaborTimesheet | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const columns = [
    "#",
    "User",
    "Date",
    "Morning In",
    "Morning Out",
    "Morning Hrs",
    "Break Time",
    "Afternoon In",
    "Afternoon Out",
    "Afternoon Hrs",
    "OT",
    "Rate",
    "Total Pay",
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
    item?: LaborTimesheet
  ) => {
    setModalMode(mode);
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const handleDeleteClick = (item: LaborTimesheet) => {
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

  const handleFormSubmit = (data: createLaborTimesheetInput | updateLaborTimesheetInput) => {
    const mornHrs = calculateHours(data.morningIn ?? "", data.morningOut ?? "");
    const aftHrs = calculateHours(data.afternoonIn ?? "", data.afternoonOut ?? "");
    const breakTime = calculateBreak(data.morningOut ?? "", data.afternoonIn ?? "");
    const ot = Number(data.ot) || 0;
    const rate = Number(data.rate) || 0;
    const totalPay = (mornHrs + aftHrs) * rate + ot;

    const input = {
      userId: data.userId,
      date: data.date ? new Date(data.date) : new Date(),
      morningIn: data.morningIn,
      morningOut: data.morningOut,
      mornHrs,
      bt: breakTime,
      afternoonIn: data.afternoonIn,
      afternoonOut: data.afternoonOut,
      aftHrs,
      ot,
      dt: 0,
      rate,
      totalPay,
      status: data.status,
    };

    if (modalMode === "create") {
      createMutation.mutate(input as createLaborTimesheetInput, {
        onSuccess: () => setShowModal(false),
      });
    } else if (modalMode === "edit" && selectedItem?.id) {
      updateMutation.mutate(
        { ...input, id: selectedItem.id } as updateLaborTimesheetInput & {
          id: string;
        },
        {
          onSuccess: () => setShowModal(false),
        }
      );
    }
  };

  if (isLoadingTimes || isLoadingUsers) {
    return <p className="p-4">Loading labor timesheets or users...</p>;
  }

  if (isErrorTimes) {
    return (
      <p className="p-4 text-destructive">
        Error loading labor timesheets: {timesError?.message}
      </p>
    );
  }

  if (isErrorUsers) {
    return (
      <p className="p-4 text-destructive">
        Error loading users: {usersError?.message}
      </p>
    );
  }

  return (
    <div>
      <Button
        onClick={() => handleOpenModal("create")}
        className="mb-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Add New
      </Button>

      <div className="overflow-x-auto">
        <Table className="min-w-full border border-border divide-y divide-border table-auto">
          <TableHeader className="bg-primary">
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="text-primary-foreground px-5 py-3 text-left text-sm font-medium truncate"
                >
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-primary-foreground px-5 py-3 text-left text-sm font-medium w-32 truncate">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-border">
            {laborTimesheets?.map((row, idx) => {
              const user = users?.find((u) => u.id === row.userId);
              const userName = user
                ? `${user.first_name} ${user.last_name}`
                : row.userId;

              return (
                <TableRow key={row.id} className="hover:bg-accent">
                  <TableCell className="px-5 py-2">{idx + 1}</TableCell>
                  <TableCell className="px-5 py-2">{userName}</TableCell>
                  <TableCell className="px-5 py-2">
                    {format(row.date)}
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
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 w-full">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute left-0 mt-2 w-40 bg-white border divide-y divide-gray-100 rounded-md shadow-lg z-50">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => handleOpenModal("view", row)}
                              className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-accent" : ""
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
                              className={`w-full text-left px-3 py-2 text-sm ${active ? "bg-accent" : ""
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
                              className={`w-full text-left px-3 py-2 text-sm text-destructive ${active ? "bg-accent" : ""
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
              <CreateLaborTimesheetForm
                onClose={() => setShowModal(false)}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <EditLaborTimesheetForm
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
        message="Are you sure you want to delete this labor timesheet?"
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
