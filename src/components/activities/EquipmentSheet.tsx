"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus, Edit, Trash, Eye } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmModal from "../common/ui/ConfirmModal";
import CreateEquipmentTimesheetForm from "../forms/timesheet/CreateEquipmentTimesheetForm";
import EditEquipmentTimesheetForm from "../forms/timesheet/EditEquipmentTimesheetForm";
import { formatDate as format } from "@/utils/dateUtils";
import { ReusableTable, ColumnConfig } from "@/components/common/ReusableTable";
import GenericDownloads, { Column as DownloadColumn } from "@/components/common/GenericDownloads";
import { getBreakTime } from "./breakUtils";

export const EquipmentSheet: React.FC = () => {
  const {
    data: equipmentTimesheets,
    isLoading: isLoadingTimes,
    isError: isErrorTimes,
    error: timesError,
  } = useEquipmentTimesheets();

  const {
    data: equipment,
    isLoading: isLoadingEquipment,
  } = useEquipments();

  const createMutation = useCreateEquipmentTimesheet();
  const updateMutation = useUpdateEquipmentTimesheet();
  const deleteMutation = useDeleteEquipmentTimesheet();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedItem, setSelectedItem] = useState<EquipmentTimesheet | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = (mode: "create" | "edit" | "view", item?: EquipmentTimesheet) => {
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

  const handleFormSubmit = (data: any) => {
    if (modalMode === "create") {
      createMutation.mutate(data as createEquipmentTimesheetInput, {
        onSuccess: () => setShowModal(false),
      });
    } else if (modalMode === "edit" && selectedItem?.id) {
      updateMutation.mutate(
        { ...data, id: selectedItem.id } as updateEquipmentTimesheetInput & { id: string },
        { onSuccess: () => setShowModal(false) }
      );
    }
  };

  const columns: ColumnConfig<EquipmentTimesheet>[] = [
    {
      key: "index",
      label: "#",
      render: (_, idx) => idx + 1,
      isDefault: true,
    },
    {
      key: "equipment",
      label: "Equipment",
      render: (row) => {
        const name = equipment?.find((e) => e.id === row.equipmentId)?.item || row.equipmentId;
        return <span className="font-bold text-gray-800">{name}</span>;
      },
      isDefault: true,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => format(row.date),
      isDefault: true,
    },
    {
      key: "morningIn",
      label: "Morning In",
      render: (row) => row.morningIn || "-",
      isDefault: true,
    },
    {
      key: "morningOut",
      label: "Morning Out",
      render: (row) => row.morningOut || "-",
      isDefault: true,
    },
    {
      key: "bt",
      label: "Break",
      render: (row) => {
        const breakTime = getBreakTime(row.morningOut || "", row.afternoonIn || "");
        return <span className="font-medium text-gray-600">{breakTime.toFixed(2)}</span>;
      },
      isDefault: true,
    },
    {
      key: "afternoonIn",
      label: "Afternoon In",
      render: (row) => row.afternoonIn || "-",
      isDefault: true,
    },
    {
      key: "afternoonOut",
      label: "Afternoon Out",
      render: (row) => row.afternoonOut || "-",
      isDefault: true,
    },
    {
      key: "totalHrs",
      label: "Total Hrs",
      render: (row) => {
        const total = (row.mornHrs || 0) + (row.aftHrs || 0);
        return <span className="font-bold text-gray-900">{total.toFixed(2)}</span>;
      },
      isDefault: true,
    },
    {
      key: "totalPay",
      label: "Total Cost",
      render: (row) => <span className="font-mono text-gray-600">${row.totalPay.toFixed(2)}</span>,
      isDefault: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${row.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {row.status}
        </span>
      ),
      isDefault: true,
    },
    {
      key: "menu",
      label: "Menu",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-primary-foreground p-0 bg-primary hover:bg-primary/90 h-8 px-2"
            >
              Action
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenModal("view", row)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenModal("edit", row)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(row)} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      isDefault: true,
    },
  ];

  const downloadColumns: DownloadColumn<EquipmentTimesheet>[] = [
    { header: "Equipment", accessor: (row) => equipment?.find((e) => e.id === row.equipmentId)?.item || row.equipmentId },
    { header: "Date", accessor: (row) => format(row.date) },
    { header: "Morning In", accessor: "morningIn" },
    { header: "Morning Out", accessor: "morningOut" },
    { header: "Break", accessor: (row) => getBreakTime(row.morningOut || "", row.afternoonIn || "").toFixed(2) },
    { header: "Afternoon In", accessor: "afternoonIn" },
    { header: "Afternoon Out", accessor: "afternoonOut" },
    { header: "Total Hrs", accessor: (row) => ((row.mornHrs || 0) + (row.aftHrs || 0)).toFixed(2) },
    { header: "Total Cost", accessor: (row) => row.totalPay.toFixed(2) },
    { header: "Status", accessor: "status" },
  ];

  const filteredData = useMemo(() => {
    if (!equipmentTimesheets) return [];
    if (!searchTerm) return equipmentTimesheets;
    return equipmentTimesheets.filter((row) => {
      const name = equipment?.find((e) => e.id === row.equipmentId)?.item || "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [equipmentTimesheets, searchTerm, equipment]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Equipment Timesheets</h2>
        <div className="flex flex-wrap gap-2">
          <GenericDownloads
            data={filteredData}
            title="Equipment Timesheet"
            columns={downloadColumns}
          />
          <Button
            onClick={() => handleOpenModal("create")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex gap-2"
          >
            <Plus className="w-4 h-4" /> New Entry
          </Button>
        </div>
      </div>

      <ReusableTable
        title="Equipment Timesheets"
        data={filteredData}
        columns={columns}
        isLoading={isLoadingTimes || isLoadingEquipment}
        isError={isErrorTimes}
        errorMessage={timesError?.message}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search equipment..."
        pageSize={10}
        hideTitle={true}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Create Timesheet Entry' : modalMode === 'edit' ? 'Edit Entry' : 'Entry Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
                &times;
              </button>
            </div>
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
