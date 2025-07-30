"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import GenericDownload from "@/components/common/GenericDownloads";
import {
  GenericFilter,
  FilterField,
  FilterValues,
  Option,
} from "@/components/common/GenericFilter";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  useRequestDeliveries,
  useDeleteRequestDelivery,
} from "@/hooks/useRequestDeliveries";
import RequestDeliveryTableSkeleton from "@/components/skeletons/RequestDeliveryTableSkeleton";

const columnOptions: Record<string, string> = {
  refNumber: "Ref No.",
  deliveredBy: "Delivered By",
  recievedBy: "Received By",
  status: "Status",
  deliveryDate: "Delivery Date",
  recievedQuantity: "Qty Received",
  site: "Site",
  remarks: "Remarks",
  actions: "Actions",
};

const RequestDeliveryPage: React.FC = () => {
  const router = useRouter();
  const { data: deliveries = [], isLoading, error } = useRequestDeliveries();
  const { mutate: deleteDelivery } = useDeleteRequestDelivery();

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  if (isLoading) return <RequestDeliveryTableSkeleton />;
  if (error)
    return (
      <div className="text-red-500">Error loading request deliveries.</div>
    );

  const statusOptions: Option<string>[] = [
    { label: "Pending", value: "Pending" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  const filterFields: FilterField<string>[] = [
    { name: "status", label: "Status", type: "select", options: statusOptions },
    {
      name: "deliveredBy",
      label: "Delivered By",
      type: "text",
      placeholder: "Name...",
    },
  ];

  const filteredDeliveries = deliveries.filter((d) => {
    let matches = true;
    if (filterValues.status)
      matches = matches && d.status === filterValues.status;
    if (typeof filterValues.deliveredBy === "string") {
      matches =
        matches &&
        d.deliveredBy
          ?.toLowerCase()
          .includes(filterValues.deliveredBy.toLowerCase());
    }

    return matches;
  });

  const downloadData = filteredDeliveries.map((d) => ({
    ID: d.id,
    Ref: d.refNumber || "N/A",
    DeliveredBy: d.deliveredBy,
    ReceivedBy: d.recievedBy,
    Status: d.status,
    DeliveryDate: new Date(d.deliveryDate).toLocaleDateString(),
    Quantity: d.recievedQuantity,
    Site: d.site?.name || "N/A",
    Remarks: d.remarks || "N/A",
  }));

  const handleDelete = () => {
    if (selectedId) {
      deleteDelivery(selectedId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => router.push(`/request-delivery/${id}`);

  return (
    <div className="mt-8">
      <GenericDownload data={downloadData} title="" columns={[]} />
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

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this delivery record?"
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
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("refNumber") && (
                    <td className="px-4 py-2 font-medium">
                      {d.refNumber || "N/A"}
                    </td>
                  )}
                  {selectedColumns.includes("deliveredBy") && (
                    <td className="px-4 py-2">{d.deliveredBy}</td>
                  )}
                  {selectedColumns.includes("recievedBy") && (
                    <td className="px-4 py-2">{d.recievedBy}</td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2">
                      <span
                        className={`badge px-2 py-1 rounded ${
                          d.status === "Delivered"
                            ? "text-green-600"
                            : d.status === "Pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("deliveryDate") && (
                    <td className="px-4 py-2">
                      {new Date(d.deliveryDate).toLocaleDateString()}
                    </td>
                  )}
                  {selectedColumns.includes("recievedQuantity") && (
                    <td className="px-4 py-2">{d.recievedQuantity}</td>
                  )}
                  {selectedColumns.includes("site") && (
                    <td className="px-4 py-2">{d.site?.name || "N/A"}</td>
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
                                onClick={() => handleView(d.id)}
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
                                  setSelectedId(d.id);
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
                  No request deliveries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestDeliveryPage;
