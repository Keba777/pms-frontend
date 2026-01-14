"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus, Edit, Trash, Eye } from "lucide-react";
import {
  useLaborTimesheets,
  useCreateLaborTimesheet,
  useUpdateLaborTimesheet,
  useDeleteLaborTimesheet,
} from "@/hooks/useTimesheets";
import { useUsers } from "@/hooks/useUsers";
import { useCheckIn, useCheckOut } from "@/hooks/useAttendance";
import {
  createLaborTimesheetInput,
  updateLaborTimesheetInput,
  LaborTimesheet,
} from "@/types/timesheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmModal from "../common/ui/ConfirmModal";
import CreateLaborTimesheetForm from "../forms/timesheet/CreateLaborTimesheetForm";
import EditLaborTimesheetForm from "../forms/timesheet/EditLaborTimesheetForm";
import { formatDate as format } from "@/utils/dateUtils";
import { ReusableTable, ColumnConfig } from "@/components/common/ReusableTable";
import GenericDownloads, { Column as DownloadColumn } from "@/components/common/GenericDownloads";
import { getBreakTime } from "./breakUtils";

export const LaborSheet: React.FC = () => {
  const {
    data: laborTimesheets,
    isLoading: isLoadingTimes,
    isError: isErrorTimes,
    error: timesError,
  } = useLaborTimesheets();

  const { data: users, isLoading: isLoadingUsers } = useUsers();

  const createMutation = useCreateLaborTimesheet();
  const updateMutation = useUpdateLaborTimesheet();
  const deleteMutation = useDeleteLaborTimesheet();

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedItem, setSelectedItem] = useState<LaborTimesheet | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = (mode: "create" | "edit" | "view", item?: LaborTimesheet) => {
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
    if (modalMode === "create") {
      createMutation.mutate(data as createLaborTimesheetInput, {
        onSuccess: () => setShowModal(false),
      });
    } else if (modalMode === "edit" && selectedItem?.id) {
      updateMutation.mutate(
        { ...data, id: selectedItem.id } as updateLaborTimesheetInput & { id: string },
        { onSuccess: () => setShowModal(false) }
      );
    }
  };

  const handleActionClick = (row: LaborTimesheet, action: string) => {
    const resourceId = row.userId || row.laborInformationId;
    const type = row.userId ? "User" : "Labor";

    if (!resourceId) return;

    if (action === 'check-out-morning') {
      checkOutMutation.mutate({ resourceId, type, session: "Morning" });
    } else if (action === 'check-in-afternoon') {
      checkInMutation.mutate({ resourceId, type, session: "Afternoon" });
    } else if (action === 'check-out-afternoon') {
      checkOutMutation.mutate({ resourceId, type, session: "Afternoon" });
    }
  };

  const columns: ColumnConfig<LaborTimesheet>[] = [
    {
      key: "index",
      label: "#",
      render: (_, idx) => idx + 1,
      isDefault: true,
    },
    {
      key: "name",
      label: "Name",
      render: (row) => {
        const name = row.user
          ? `${row.user.first_name} ${row.user.last_name}`
          : row.laborInformation
            ? `${row.laborInformation.firstName} ${row.laborInformation.lastName}`
            : "Unknown";
        return <span className="font-bold text-gray-800">{name}</span>;
      },
      isDefault: true,
    },
    {
      key: "type",
      label: "Type",
      render: (row) => {
        const type = row.user ? "Staff" : "Labor";
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${type === 'Staff' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
            {type}
          </span>
        );
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
      label: "Pay",
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
      key: "primaryAction",
      label: "Action",
      render: (row) => {
        const isToday = new Date().toDateString() === new Date(row.date).toDateString();
        if (!isToday) return <span className="text-gray-400 text-xs">-</span>;

        if (row.morningIn && !row.morningOut) {
          return (
            <Button size="sm" variant="outline" className="h-7 text-xs border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
              onClick={() => handleActionClick(row, 'check-out-morning')}>
              Out (M)
            </Button>
          );
        } else if (row.morningOut && !row.afternoonIn) {
          return (
            <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
              onClick={() => handleActionClick(row, 'check-in-afternoon')}>
              In (A)
            </Button>
          );
        } else if (row.afternoonIn && !row.afternoonOut) {
          return (
            <Button size="sm" variant="outline" className="h-7 text-xs border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800"
              onClick={() => handleActionClick(row, 'check-out-afternoon')}>
              Out (A)
            </Button>
          );
        }
        return <span className="text-gray-400 text-xs">-</span>;
      },
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

  const downloadColumns: DownloadColumn<LaborTimesheet>[] = [
    { header: "Name", accessor: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : row.laborInformation ? `${row.laborInformation.firstName} ${row.laborInformation.lastName}` : "Unknown" },
    { header: "Date", accessor: (row) => format(row.date) },
    { header: "Morning In", accessor: "morningIn" },
    { header: "Morning Out", accessor: "morningOut" },
    { header: "Break", accessor: (row) => getBreakTime(row.morningOut || "", row.afternoonIn || "").toFixed(2) },
    { header: "Afternoon In", accessor: "afternoonIn" },
    { header: "Afternoon Out", accessor: "afternoonOut" },
    { header: "Total Hrs", accessor: (row) => ((row.mornHrs || 0) + (row.aftHrs || 0)).toFixed(2) },
    { header: "Pay", accessor: (row) => row.totalPay.toFixed(2) },
    { header: "Status", accessor: "status" },
  ];

  const filteredData = useMemo(() => {
    if (!laborTimesheets) return [];
    if (!searchTerm) return laborTimesheets;
    return laborTimesheets.filter((row) => {
      const name = row.user
        ? `${row.user.first_name} ${row.user.last_name}`
        : row.laborInformation
          ? `${row.laborInformation.firstName} ${row.laborInformation.lastName}`
          : "";
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [laborTimesheets, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Labor Timesheets</h2>
        <div className="flex flex-wrap gap-2">
          <GenericDownloads
            data={filteredData}
            title="Labor Timesheet"
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
        title="Labor Timesheets"
        data={filteredData}
        columns={columns}
        isLoading={isLoadingTimes || isLoadingUsers}
        isError={isErrorTimes}
        errorMessage={timesError?.message}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search laborers..."
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
