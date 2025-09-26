import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

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
import CreateMaterialSheetForm from "../forms/timesheet/CreateMaterialSheetForm";
import EditMaterialSheetForm from "../forms/timesheet/EditMaterialSheetForm";

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
    isError: materialsError,
    error: materialsErrorObj,
  } = useMaterials();

  const createMutation = useCreateMaterialSheet();
  const updateMutation = useUpdateMaterialSheet();
  const deleteMutation = useDeleteMaterialSheet();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedItem, setSelectedItem] = useState<MaterialBalanceSheet | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const columns = [
    "#",
    "Material",
    "Date",
    "Received Qty",
    "Utilized Qty",
    "Balance",
    "Assigned To",
    "Remark",
    "Status",
  ];

  const handleOpenModal = (
    mode: "create" | "edit" | "view",
    item?: MaterialBalanceSheet
  ) => {
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

  const handleFormSubmit = (
    data: createMaterialBalanceSheetInput | updateMaterialBalanceSheetInput
  ) => {
    const receivedQty = Number(data.receivedQty) || 0;
    const utilizedQty = Number(data.utilizedQty) || 0;
    const balance = receivedQty - utilizedQty;

    const input = {
      materialId: data.materialId,
      date: data.date ? new Date(data.date) : new Date(),
      receivedQty,
      utilizedQty,
      balance,
      assignedTo: data.assignedTo,
      remark: data.remark || "",
      status: data.status,
    };

    if (modalMode === "create") {
      createMutation.mutate(input as createMaterialBalanceSheetInput, {
        onSuccess: () => setShowModal(false),
      });
    } else if (modalMode === "edit" && selectedItem?.id) {
      updateMutation.mutate(
        { ...input, id: selectedItem.id } as updateMaterialBalanceSheetInput & {
          id: string;
        },
        {
          onSuccess: () => setShowModal(false),
        }
      );
    }
  };

  if (sheetsLoading || materialsLoading) {
    return <p className="p-4">Loading...</p>;
  }

  if (sheetsError) {
    return (
      <p className="p-4 text-red-600">
        Error loading sheets: {sheetsErrorObj?.message}
      </p>
    );
  }

  if (materialsError) {
    return (
      <p className="p-4 text-red-600">
        Error loading materials: {materialsErrorObj?.message}
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
            {materialSheets?.map((row, idx) => {
              const mat = materials?.find((m) => m.id === row.materialId);

              return (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  <TableCell className="px-5 py-2">{idx + 1}</TableCell>
                  <TableCell className="px-5 py-2">
                    {mat?.item || row.materialId}
                  </TableCell>
                  <TableCell className="px-5 py-2">
                    {new Date(row.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-5 py-2">{row.receivedQty}</TableCell>
                  <TableCell className="px-5 py-2">{row.utilizedQty}</TableCell>
                  <TableCell className="px-5 py-2">{row.balance}</TableCell>
                  <TableCell className="px-5 py-2">{row.assignedTo}</TableCell>
                  <TableCell className="px-5 py-2">
                    {row.remark || "–"}
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
