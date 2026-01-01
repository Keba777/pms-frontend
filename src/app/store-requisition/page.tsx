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
import { useStoreRequisitions, useDeleteStoreRequisition, useUpdateStoreRequisition } from "@/hooks/useStoreRequisition";
import StoreRequisitionForm from "@/components/forms/resource/StoreRequisitionForm";
import EditStoreRequisitionForm from "@/components/forms/resource/EditStoreRequisitionForm";
import { formatDate as format } from "@/utils/dateUtils";

const columnOptions: Record<string, string> = {
  no: "No",
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
  const { mutate: updateStoreRequisition } = useUpdateStoreRequisition();
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

  const [showEditForm, setShowEditForm] = useState(false);
  const [requisitionToEdit, setRequisitionToEdit] = useState<any | null>(null);

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
      header: "No",
      accessor: (_r, index) => index! + 1,
    },
    { header: "Description", accessor: (r: any) => r.description || "N/A" },
    { header: "Unit of Measure", accessor: (r: any) => r.unitOfMeasure || "N/A" },
    { header: "Quantity", accessor: (r: any) => r.quantity || 0 },
    { header: "Remarks", accessor: (r: any) => r.remarks || "N/A" },
    {
      header: "Created At",
      accessor: (r: any) =>
        r.createdAt ? format(r.createdAt) : "N/A",
    },
    {
      header: "Updated At",
      accessor: (r: any) =>
        r.updatedAt ? format(r.updatedAt) : "N/A",
    },
  ];

  const handleDelete = () => {
    if (selectedRequisitionId) {
      deleteStoreRequisition(selectedRequisitionId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => router.push(`/store-requisition/${id}`);

  const handleEditClick = (r: any) => {
    setRequisitionToEdit(r);
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: any) => {
    updateStoreRequisition(data);
    setShowEditForm(false);
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
          Store Requisitions
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-cyan-700 rounded-lg hover:bg-cyan-800 transition-colors shadow-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={16} height={16} />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div ref={menuRef} className="relative w-full lg:w-auto">
              <button
                onClick={() => setShowColumnMenu((prev) => !prev)}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
              >
                Customize Columns <ChevronDown className="w-4 h-4" />
              </button>
              {showColumnMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 max-h-[60vh] overflow-y-auto backdrop-blur-sm bg-white/95">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Columns</p>
                  </div>
                  {Object.entries(columnOptions).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(key)}
                        onChange={() => toggleColumn(key)}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 mr-3"
                      />
                      <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <GenericDownloads
              data={filteredRequisitions}
              title="Store_Requisitions_List"
              columns={downloadColumns}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <StoreRequisitionForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showEditForm && requisitionToEdit && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EditStoreRequisitionForm
              storeRequisition={requisitionToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
            />
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
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-max divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {selectedColumns.map(
                (col) =>
                  col !== "actions" && (
                    <th
                      key={col}
                      className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      {columnOptions[col]}
                    </th>
                  )
              )}
              {selectedColumns.includes("actions") && (
                <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequisitions.length > 0 ? (
              filteredRequisitions.map((r, index) => (
                <tr key={String(r.id)} className="hover:bg-gray-50/50 transition-colors">
                  {selectedColumns.includes("no") && (
                    <td className="px-5 py-4 text-sm font-bold text-gray-700">{index + 1}</td>
                  )}
                  {selectedColumns.includes("description") && (
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">{r.description || "N/A"}</td>
                  )}
                  {selectedColumns.includes("unitOfMeasure") && (
                    <td className="px-5 py-4 text-sm text-gray-600 italic whitespace-nowrap">{r.unitOfMeasure || "N/A"}</td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-5 py-4 text-sm font-bold text-gray-700">{r.quantity || 0}</td>
                  )}
                  {selectedColumns.includes("remarks") && (
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">{r.remarks || "N/A"}</td>
                  )}
                  {selectedColumns.includes("createdAt") && (
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {r.createdAt ? format(r.createdAt) : "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("updatedAt") && (
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {r.updatedAt ? format(r.updatedAt) : "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Menu as="div" className="relative inline-block text-left">
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-all shadow-sm">
                          Action <ChevronDown className="w-3 h-3" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-[9999] py-1 backdrop-blur-sm bg-white/95">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleView(r.id.toString())}
                                className={`block w-full px-4 py-2 text-left text-xs font-bold text-gray-700 ${active ? "bg-gray-50" : ""
                                  }`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleEditClick(r)}
                                className={`block w-full px-4 py-2 text-left text-xs font-bold text-gray-700 ${active ? "bg-gray-50" : ""
                                  }`}
                              >
                                Edit
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
                                className={`block w-full px-4 py-2 text-left text-xs font-bold text-red-600 ${active ? "bg-gray-50" : ""
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
                  className="px-5 py-4 text-center text-gray-500"
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
