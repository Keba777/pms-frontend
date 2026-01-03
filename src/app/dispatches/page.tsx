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
  Option,
} from "@/components/common/GenericFilter";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { useDispatches, useDeleteDispatch, useUpdateDispatch } from "@/hooks/useDispatches";
import DispatchTableSkeleton from "@/components/skeletons/DispatchTableSkeleton";
import DispatchForm from "@/components/forms/resource/DispatchForm";
import EditDispatchForm from "@/components/forms/resource/EditDispatchForm"; // Assuming the path is correct
import { formatDate as format } from "@/utils/dateUtils";

const columnOptions: Record<string, string> = {
  refNumber: "Ref No.",
  driverName: "Driver",
  vehicleNumber: "Vehicle No.",
  vehicleType: "Vehicle Type",
  dispatchedBy: "Mode",
  status: "Status",
  dispatchedDate: "Dispatched Date",
  estArrivalTime: "Est. Arrival",
  depatureSite: "Departure",
  arrivalSite: "Arrival",
  totalTransportCost: "Cost",
  remarks: "Remarks",
  actions: "Actions",
};

const DispatchesPage: React.FC = () => {
  const { data: dispatches = [], isLoading, error } = useDispatches();
  const { mutate: deleteDispatch } = useDeleteDispatch();
  const { mutate: updateDispatch } = useUpdateDispatch();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | null>(
    null
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [dispatchToEdit, setDispatchToEdit] = useState<any | null>(null);

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

  if (isLoading) return <DispatchTableSkeleton />;
  if (error)
    return <div className="text-red-500">Error loading dispatches.</div>;

  const statusOptions: Option<string>[] = [
    { label: "Pending", value: "Pending" },
    { label: "In Transit", value: "In Transit" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const filterFields: FilterField<string>[] = [
    { name: "status", label: "Status", type: "select", options: statusOptions },
    {
      name: "driverName",
      label: "Driver",
      type: "text",
      placeholder: "Driver name...",
    },
  ];

  const filteredDispatches = dispatches.filter((d) => {
    let matches = true;
    if (filterValues.status) matches = matches && d.status === filterValues.status;
    // Add other filters if needed (e.g., driverName)
    if (filterValues.driverName && typeof filterValues.driverName === "string") {
      matches =
        matches &&
        (d.driverName ?? "")
          .toLowerCase()
          .includes((filterValues.driverName as string).toLowerCase());
    }
    return matches;
  });

  // --- DOWNLOAD COLUMNS (use the original dispatch objects) ---
  // Using Column<any>[] here to avoid reliance on an explicit Dispatch type import,
  // but accessors read fields from the original dispatch objects.
  const downloadColumns: Column<any>[] = [
    {
      header: "ID",
      accessor: (_d, index) => `RC${String(index! + 1).padStart(3, "0")}`,
    },
    { header: "Ref No.", accessor: (d: any) => d.refNumber || "N/A" },
    { header: "Driver", accessor: (d: any) => d.driverName || "N/A" },
    { header: "Vehicle No.", accessor: (d: any) => d.vehicleNumber || "N/A" },
    { header: "Vehicle Type", accessor: (d: any) => d.vehicleType || "N/A" },
    { header: "Mode", accessor: (d: any) => d.dispatchedBy || "N/A" },
    { header: "Status", accessor: (d: any) => d.status || "N/A" },
    {
      header: "Dispatched Date",
      accessor: (d: any) =>
        d.dispatchedDate ? format(d.dispatchedDate) : "N/A",
    },
    {
      header: "Est. Arrival",
      accessor: (d: any) =>
        d.estArrivalTime ? format(d.estArrivalTime) : "N/A",
    },
    { header: "Departure", accessor: (d: any) => d.depatureSite?.name || "N/A" },
    { header: "Arrival", accessor: (d: any) => d.arrivalSite?.name || "N/A" },
    {
      header: "Cost",
      accessor: (d: any) =>
        typeof d.totalTransportCost === "number" ? d.totalTransportCost : (d.totalTransportCost ?? 0),
    },
    { header: "Remarks", accessor: (d: any) => d.remarks || "N/A" },
  ];

  const handleDelete = () => {
    if (selectedDispatchId) {
      deleteDispatch(selectedDispatchId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => router.push(`/dispatches/${id}`);

  const handleEditClick = (d: any) => {
    setDispatchToEdit(d);
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: any) => {
    updateDispatch(data);
    setShowEditForm(false);
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-primary/90 uppercase tracking-tight">
          Dispatch Log
        </h1>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={16} height={16} />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div ref={menuRef} className="relative w-full lg:w-auto">
              <button
                onClick={() => setShowColumnMenu((prev) => !prev)}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
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
              data={filteredDispatches}
              title="Dispatch_List"
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
            <DispatchForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showEditForm && dispatchToEdit && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <EditDispatchForm
              dispatch={dispatchToEdit}
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
          message="Are you sure you want to delete this dispatch?"
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
            {filteredDispatches.length > 0 ? (
              filteredDispatches.map((d) => (
                <tr key={String(d.id)} className="hover:bg-gray-50/50 transition-colors">
                  {selectedColumns.includes("refNumber") && (
                    <td className="px-5 py-4 text-sm font-bold text-gray-700">
                      {d.refNumber || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("driverName") && (
                    <td className="px-5 py-4 text-sm text-gray-600 italic">{d.driverName || "N/A"}</td>
                  )}
                  {selectedColumns.includes("vehicleNumber") && (
                    <td className="px-5 py-4 text-sm text-gray-600">{d.vehicleNumber || "N/A"}</td>
                  )}
                  {selectedColumns.includes("vehicleType") && (
                    <td className="px-5 py-4 text-sm text-gray-600 italic whitespace-nowrap">{d.vehicleType || "N/A"}</td>
                  )}
                  {selectedColumns.includes("dispatchedBy") && (
                    <td className="px-5 py-4 text-sm text-gray-600">{d.dispatchedBy || "N/A"}</td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${d.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : d.status === "In Transit"
                            ? "bg-blue-50 text-blue-700"
                            : d.status === "Pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("dispatchedDate") && (
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {d.dispatchedDate ? format(d.dispatchedDate) : "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("estArrivalTime") && (
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {d.estArrivalTime ? format(d.estArrivalTime) : "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("depatureSite") && (
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap italic">
                      {d.depatureSite?.name || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("arrivalSite") && (
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap italic">
                      {d.arrivalSite?.name || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("totalTransportCost") && (
                    <td className="px-5 py-4 text-sm font-bold text-gray-700">${d.totalTransportCost}</td>
                  )}
                  {selectedColumns.includes("remarks") && (
                    <td className="px-5 py-4 text-sm text-gray-600 min-w-[200px]">{d.remarks || "N/A"}</td>
                  )}
                  {selectedColumns.includes("actions") && (
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Menu as="div" className="relative inline-block text-left">
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-xs font-black uppercase bg-cyan-700 text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm">
                          Action <ChevronDown className="w-3 h-3" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-[9999] py-1 backdrop-blur-sm bg-white/95">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleView(d.id.toString())}
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
                                onClick={() => handleEditClick(d)}
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
                                  setSelectedDispatchId(d.id.toString());
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
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No dispatches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchesPage;
