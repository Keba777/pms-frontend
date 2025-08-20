"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Equipment } from "@/types/equipment";
import { useAuthStore } from "@/store/authStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/common/ui/SearchInput";
import EquipmentForm from "@/components/forms/EquipmentForm";
import { getDuration } from "@/utils/helper";

const EquipmentsPage = () => {
  const { user } = useAuthStore();
  const siteId = user!.siteId;

  const {
    data: equipments,
    isLoading: eqLoading,
    error: eqError,
  } = useEquipments();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // find current site
  const site = sites?.find((s) => s.id === siteId);

  // filter equipments by site with memoization
  const siteEquipment = useMemo(
    () => equipments?.filter((e) => e.siteId === siteId) ?? [],
    [equipments, siteId]
  );

  // filtered list based on searchQuery
  const filteredEquipment = useMemo(
    () =>
      siteEquipment.filter((e) =>
        e.item.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, siteEquipment]
  );

  // loading / error / no-site guards
  if (eqLoading || siteLoading) return <div>Loading...</div>;
  if (eqError || siteError)
    return <div className="text-red-500">Error loading data.</div>;
  if (!site)
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );

  // status summary values
  const total = siteEquipment.length;
  const available = siteEquipment.filter(
    (l) => l.status === "Available"
  ).length;
  const unavailable = siteEquipment.filter(
    (l) => l.status === "Unavailable"
  ).length;

  const rental = siteEquipment.filter((l) => l.owner === "Rental").length;
  const own = siteEquipment.filter((l) => l.owner === "Raycon").length;

  // define download columns
  const columns: Column<Equipment>[] = [
    { header: "Item", accessor: "item" },
    { header: "Type", accessor: (row: Equipment) => row.type || "-" },
    { header: "Unit", accessor: "unit" },
    {
      header: "Manufacturer",
      accessor: (row: Equipment) => row.manufacturer || "-",
    },
    { header: "Model", accessor: (row: Equipment) => row.model || "-" },
    { header: "Year", accessor: (row: Equipment) => row.year || "-" },
    { header: "Qty", accessor: (row: Equipment) => row.quantity ?? "-" },
    {
      header: "Est Hours",
      accessor: (row: Equipment) => row.estimatedHours ?? "-",
    },
    { header: "Rate", accessor: (row: Equipment) => row.rate ?? "-" },
    {
      header: "Total Amount",
      accessor: (row: Equipment) => row.totalAmount ?? "-",
    },
    { header: "OT", accessor: (row: Equipment) => row.overTime ?? "-" },
    { header: "Condition", accessor: (row: Equipment) => row.condition || "-" },
    { header: "Owner", accessor: (row: Equipment) => row.owner || "-" },
    {
      header: "Duration",
      accessor: (row: Equipment) =>
        row.createdAt && row.updatedAt
          ? String(1 + getDuration(row.createdAt, row.updatedAt))
          : "-",
    },
    {
      header: "Starting Date",
      accessor: (row: Equipment) =>
        row.createdAt
          ? new Date(row.createdAt).toISOString().split("T")[0]
          : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Equipment) =>
        row.updatedAt
          ? new Date(row.updatedAt).toISOString().split("T")[0]
          : "-",
    },
    { header: "Status", accessor: (row: Equipment) => row.status || "-" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Top Actions */}
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-4">
          <GenericDownloads
            data={filteredEquipment}
            title={`Equipments_${site.name}`}
            columns={columns}
          />
          <button
            type="button"
            className="px-3 py-3 text-white bg-cyan-700 rounded hover:bg-cyan-800"
            onClick={() => setShowForm(true)}
            title="Create Equipment"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EquipmentForm siteId={siteId} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Equipment at “{site.name}”
      </h1>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total", value: total },
          { label: "Available", value: available },
          { label: "Unavailable", value: unavailable },
          { label: "Rental", value: rental },
          { label: "Own", value: own },
        ].map((item) => (
          <div
            key={item.label}
            className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="mr-2">{item.label} =</h2>
            <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Equipment Table */}
      {filteredEquipment.length === 0 ? (
        <p className="text-gray-600">No equipment match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                {[
                  "Item",
                  "Type",
                  "Unit",
                  "Manufacturer",
                  "Model",
                  "Year",
                  "Qty",
                  "Est Hours",
                  "Rate",
                  "Total Amount",
                  "OT",
                  "Condition",
                  "Owner",
                  "Duration",
                  "Starting Date",
                  "Due Date",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((eq, idx) => (
                <tr key={eq.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/equipment/${eq.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {eq.item}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.type || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.unit}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.manufacturer || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.model || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.year || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.quantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.estimatedHours ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.rate ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.totalAmount ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.overTime ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.condition || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.owner || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.createdAt && eq.updatedAt
                      ? 1 + getDuration(eq.createdAt, eq.updatedAt)
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.createdAt
                      ? new Date(eq.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.updatedAt
                      ? new Date(eq.updatedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {eq.status || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute left-0 mt-2 w-full origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-3 py-2 text-sm text-gray-700`}
                            >
                              View
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-3 py-2 text-sm text-gray-700`}
                            >
                              Edit
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-3 py-2 text-sm text-red-600`}
                            >
                              Delete
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={() => console.log("Manage clicked")}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-3 py-2 text-sm text-gray-700`}
                            >
                              Manage
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EquipmentsPage;
