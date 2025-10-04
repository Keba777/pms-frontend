"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, PlusIcon } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import GenericDownload from "@/components/common/GenericDownloads";
import {
  GenericFilter,
  FilterField,
  FilterValues,
  Option,
} from "@/components/common/GenericFilter";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import { useDispatches, useDeleteDispatch } from "@/hooks/useDispatches";
import DispatchTableSkeleton from "@/components/skeletons/DispatchTableSkeleton";
import DispatchForm from "@/components/forms/resource/DispatchForm";

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
    if (filterValues.status)
      matches = matches && d.status === filterValues.status;

    return matches;
  });

  const downloadData = filteredDispatches.map((d) => ({
    ID: d.id,
    Ref: d.refNumber || "N/A",
    Driver: d.driverName || "N/A",
    Vehicle: d.vehicleNumber || "N/A",
    Type: d.vehicleType || "N/A",
    Mode: d.dispatchedBy || "N/A",
    Status: d.status,
    Dispatched: new Date(d.dispatchedDate).toLocaleDateString(),
    Arrival: new Date(d.estArrivalTime).toLocaleDateString(),
    From: d.depatureSite?.name || "N/A",
    To: d.arrivalSite?.name || "N/A",
    Cost: d.totalTransportCost,
    Remarks: d.remarks || "N/A",
  }));

  const handleDelete = () => {
    if (selectedDispatchId) {
      deleteDispatch(selectedDispatchId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => router.push(`/dispatch/${id}`);

  return (
    <div className="mt-8">
      <div className="flex space-x-6">
        <button
          className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon width={15} height={12} />
        </button>
        <GenericDownload data={downloadData} title="" columns={[]} />
      </div>

      <div className="flex items-center justify-between my-5">
        <div ref={menuRef}>
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
            <DispatchForm onClose={() => setShowForm(false)} />
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
            {filteredDispatches.length > 0 ? (
              filteredDispatches.map((d) => (
                <tr key={String(d.id)} className="hover:bg-gray-50">
                  {selectedColumns.includes("refNumber") && (
                    <td className="px-4 py-2 font-medium">
                      {d.refNumber || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("driverName") && (
                    <td className="px-4 py-2">{d.driverName || "N/A"}</td>
                  )}
                  {selectedColumns.includes("vehicleNumber") && (
                    <td className="px-4 py-2">{d.vehicleNumber || "N/A"}</td>
                  )}
                  {selectedColumns.includes("vehicleType") && (
                    <td className="px-4 py-2">{d.vehicleType || "N/A"}</td>
                  )}
                  {selectedColumns.includes("dispatchedBy") && (
                    <td className="px-4 py-2">{d.dispatchedBy || "N/A"}</td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2">
                      <span
                        className={`badge px-2 py-1 rounded ${
                          d.status === "Delivered"
                            ? "text-green-600"
                            : d.status === "In Transit"
                            ? "text-blue-500"
                            : d.status === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("dispatchedDate") && (
                    <td className="px-4 py-2">
                      {new Date(d.dispatchedDate).toLocaleDateString()}
                    </td>
                  )}
                  {selectedColumns.includes("estArrivalTime") && (
                    <td className="px-4 py-2">
                      {new Date(d.estArrivalTime).toLocaleDateString()}
                    </td>
                  )}
                  {selectedColumns.includes("depatureSite") && (
                    <td className="px-4 py-2">
                      {d.depatureSite?.name || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("arrivalSite") && (
                    <td className="px-4 py-2">
                      {d.arrivalSite?.name || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("totalTransportCost") && (
                    <td className="px-4 py-2">${d.totalTransportCost}</td>
                  )}
                  {selectedColumns.includes("remarks") && (
                    <td className="px-4 py-2">{d.remarks || "N/A"}</td>
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
                                onClick={() => handleView(d.id.toString())}
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
                                  setSelectedDispatchId(d.id.toString());
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
