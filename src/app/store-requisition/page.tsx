"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, PlusIcon } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  GenericFilter,
  FilterField,
  FilterValues,
} from "@/components/common/GenericFilter";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { useStoreRequisitions, useDeleteStoreRequisition } from "@/hooks/useStoreRequisition";
import StoreRequisitionForm from "@/components/forms/resource/StoreRequisitionForm"; // We'll define this below


const columnOptions: Record<string, string> = {
  id: "ID",
  description: "Description",
  unitOfMeasure: "Unit of Measure",
  quantity: "Quantity",
  remarks: "Remarks",
  createdAt: "Created At",
  updatedAt: "Updated At",
  actions: "Actions",
};

const StoreRequisitionsPage: React.FC = () => {
  const { data: requisitions = [], isLoading, error } = useStoreRequisitions();
  const { mutate: deleteStoreRequisition } = useDeleteStoreRequisition();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(
    null
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) return <div>Loading store requisitions...</div>;
  if (error)
    return <div className="text-red-500">Error loading store requisitions.</div>;

  const filterFields: FilterField<string>[] = [
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Search by description...",
    },
    // Add more filters if needed, e.g., select for unitOfMeasure options if available
  ];

  const filteredRequisitions = requisitions.filter((r) => {
    let matches = true;
    if (filterValues.description && typeof filterValues.description === "string") {
      matches =
        matches &&
        (r.description ?? "")
          .toLowerCase()
          .includes((filterValues.description as string).toLowerCase());
    }
    // Add other filters if needed (e.g., approvalId)
    return matches;
  });

  // DOWNLOAD COLUMNS (use the original requisition objects)
  const downloadColumns: Column<any>[] = [
    {
      header: "ID",
      accessor: (_r, index) => `SR${String(index! + 1).padStart(3, "0")}`,
    },
    { header: "Description", accessor: (r: any) => r.description || "N/A" },
    { header: "Unit of Measure", accessor: (r: any) => r.unitOfMeasure || "N/A" },
    { header: "Quantity", accessor: (r: any) => r.quantity || 0 },
    { header: "Remarks", accessor: (r: any) => r.remarks || "N/A" },
    // {
    //   header: "Activity",
    //   accessor: (r: any) => r.approval?.request?.activity?.activity_name || r.approvalId || "N/A",
    // },
    {
      header: "Created At",
      accessor: (r: any) =>
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
    },
    {
      header: "Updated At",
      accessor: (r: any) =>
        r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "N/A",
    },
  ];

  const handleDelete = () => {
    if (selectedRequisitionId) {
      deleteStoreRequisition(selectedRequisitionId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => router.push(`/store-requisitions/${id}`);

  return (
    <div className="mt-8">
      <div className="flex justify-end space-x-6 items-center">
        <button
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon width={15} height={12} />
        </button>
        <div className="w-full sm:w-auto">
          <GenericDownloads
            data={filteredRequisitions}
            title="Store_Requisitions_List"
            columns={downloadColumns}
          />
        </div>
      </div>

      <div className="flex items-center justify-between my-5">
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
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <StoreRequisitionForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this store requisition?"
          confirmText="DELETE"
          confirmButtonText="Delete"
          showInput={false}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.map(
                (col) =>
                  col !== "actions" && (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-sm text-white"
                    >
                      {columnOptions[col]}
                    </th>
                  )
              )}
              {selectedColumns.includes("actions") && (
                <th className="px-4 py-3 text-left text-sm text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.map((r) => (
                <tr key={String(r.id)} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 font-medium">
                      {/* Assuming sequential ID display; adjust if needed */}
                      {filteredRequisitions.findIndex((req) => req.id === r.id) + 1}
                    </td>
                  )}
                  {selectedColumns.includes("description") && (
                    <td className="px-4 py-2">{r.description || "N/A"}</td>
                  )}
                  {selectedColumns.includes("unitOfMeasure") && (
                    <td className="px-4 py-2">{r.unitOfMeasure || "N/A"}</td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-4 py-2">{r.quantity || 0}</td>
                  )}
                  {selectedColumns.includes("remarks") && (
                    <td className="px-4 py-2">{r.remarks || "N/A"}</td>
                  )}

                  {selectedColumns.includes("createdAt") && (
                    <td className="px-4 py-2">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("updatedAt") && (
                    <td className="px-4 py-2">
                      {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="px-4 py-2">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleView(r.id.toString())}
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  setSelectedRequisitionId(r.id.toString());
                                  setIsDeleteModalOpen(true);
                                }}
                                className={`block w-full px-4 py-2 text-left ${
                                  active ? "bg-blue-100" : ""
                                }`}
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
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No store requisitions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreRequisitionsPage;