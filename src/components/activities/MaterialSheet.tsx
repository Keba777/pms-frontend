"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus, Edit, Trash, Eye } from "lucide-react";
import {
  useMaterialSheets,
  useCreateMaterialSheet,
  useUpdateMaterialSheet,
  useDeleteMaterialSheet,
} from "@/hooks/useTimesheets";
import { useMaterials } from "@/hooks/useMaterials";
import {
  createMaterialBalanceSheetInput,
  updateMaterialBalanceSheetInput,
  MaterialBalanceSheet,
} from "@/types/timesheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmModal from "../common/ui/ConfirmModal";
import CreateMaterialSheetForm from "../forms/timesheet/CreateMaterialSheetForm";
import EditMaterialSheetForm from "../forms/timesheet/EditMaterialSheetForm";
import { formatDate as format } from "@/utils/dateUtils";
import { ReusableTable, ColumnConfig } from "@/components/common/ReusableTable";
import GenericDownloads, { Column as DownloadColumn } from "@/components/common/GenericDownloads";

export const MaterialSheet: React.FC = () => {
  const {
    data: materialSheets,
    isLoading: sheetsLoading,
    isError: sheetsError,
    error: sheetsErrorObj,
  } = useMaterialSheets();

  const {
    data: materials,
    isLoading: materialsLoading,
  } = useMaterials();

  const createMutation = useCreateMaterialSheet();
  const updateMutation = useUpdateMaterialSheet();
  const deleteMutation = useDeleteMaterialSheet();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedItem, setSelectedItem] = useState<MaterialBalanceSheet | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = (mode: "create" | "edit" | "view", item?: MaterialBalanceSheet) => {
    setModalMode(mode);
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const handleDeleteClick = (item: MaterialBalanceSheet) => {
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
      createMutation.mutate(data as createMaterialBalanceSheetInput, {
        onSuccess: () => setShowModal(false),
      });
    } else if (modalMode === "edit" && selectedItem?.id) {
      updateMutation.mutate(
        { ...data, id: selectedItem.id } as updateMaterialBalanceSheetInput & { id: string },
        { onSuccess: () => setShowModal(false) }
      );
    }
  };

  const columns: ColumnConfig<MaterialBalanceSheet>[] = [
    {
      key: "index",
      label: "#",
      render: (_, idx) => idx + 1,
      isDefault: true,
    },
    {
      key: "material",
      label: "Material",
      render: (row) => {
        const mat = materials?.find((m) => m.id === row.materialId);
        return <span className="font-bold text-gray-800">{mat?.item || row.materialId}</span>;
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
      key: "receivedQty",
      label: "Received Qty",
      render: (row) => row.receivedQty,
      isDefault: true,
    },
    {
      key: "utilizedQty",
      label: "Utilized Qty",
      render: (row) => row.utilizedQty,
      isDefault: true,
    },
    {
      key: "balance",
      label: "Balance",
      render: (row) => <span className="font-bold text-gray-900">{row.balance}</span>,
      isDefault: true,
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (row) => row.assignedTo || "-",
      isDefault: true,
    },
    {
      key: "remark",
      label: "Remark",
      render: (row) => <span className="text-gray-500 italic">{row.remark || "–"}</span>,
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

  const downloadColumns: DownloadColumn<MaterialBalanceSheet>[] = [
    { header: "Material", accessor: (row) => materials?.find((m) => m.id === row.materialId)?.item || row.materialId },
    { header: "Date", accessor: (row) => format(row.date) },
    { header: "Received Qty", accessor: "receivedQty" },
    { header: "Utilized Qty", accessor: "utilizedQty" },
    { header: "Balance", accessor: "balance" },
    { header: "Assigned To", accessor: "assignedTo" },
    { header: "Remark", accessor: "remark" },
    { header: "Status", accessor: "status" },
  ];

  const filteredData = useMemo(() => {
    if (!materialSheets) return [];
    if (!searchTerm) return materialSheets;
    return materialSheets.filter((row) => {
      const mat = materials?.find((m) => m.id === row.materialId);
      return (mat?.item || "").toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [materialSheets, searchTerm, materials]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Material Balance Sheets</h2>
        <div className="flex flex-wrap gap-2">
          <GenericDownloads
            data={filteredData}
            title="Material Balance Sheet"
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
        title="Material Balance Sheets"
        data={filteredData}
        columns={columns}
        isLoading={sheetsLoading || materialsLoading}
        isError={sheetsError}
        errorMessage={sheetsErrorObj?.message}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search materials..."
        pageSize={10}
        hideTitle={true}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Create Sheet Entry' : modalMode === 'edit' ? 'Edit Entry' : 'Entry Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
                &times;
              </button>
            </div>
            {modalMode === "create" ? (
              <CreateMaterialSheetForm
                onClose={() => setShowModal(false)}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <EditMaterialSheetForm
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
        message="Are you sure you want to delete this material balance sheet?"
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
