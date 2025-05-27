"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Material } from "@/types/material";
import { Warehouse } from "@/types/warehouse";
import { Site } from "@/types/site";
import MaterialForm from "@/components/forms/MaterialForm";
import { useAuthStore } from "@/store/authStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

// New imports
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/ui/SearchInput";

const MaterialsPage = () => {
  const { user } = useAuthStore();
  const siteId = user?.siteId;
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: materials,
    isLoading: matLoading,
    error: matError,
  } = useMaterials();
  const {
    data: warehouses,
    isLoading: whLoading,
    error: whError,
  } = useWarehouses();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  // Find current site and filter materials
  const site: Site | undefined = sites?.find((s) => s.id === siteId);
  const siteWarehouseIds =
    warehouses
      ?.filter((w: Warehouse) => w.siteId === siteId)
      .map((w) => w.id) ?? [];
  const siteMaterials: Material[] =
    materials?.filter(
      (m) => m.warehouseId && siteWarehouseIds.includes(m.warehouseId)
    ) ?? [];

  // Filter by search query (hook must be unconditional)
  const filteredMaterials = useMemo(
    () =>
      siteMaterials.filter((m) =>
        m.item.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, siteMaterials]
  );

  if (matLoading || whLoading || siteLoading) return <div>Loading...</div>;
  if (matError || whError || siteError)
    return <div className="text-red-500">Error loading data.</div>;
  if (!site)
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );

  const total = siteMaterials.length;
  const available = siteMaterials.filter(
    (l) => l.quantity && l.quantity >= 1
  ).length;
  const inactive = siteMaterials.filter((l) => l.quantity === 0).length;

  // Define columns for downloads
  const columns: Column<Material>[] = [
    { header: "ID", accessor: (row) => `RC00${row.id}` },
    { header: "Item Name", accessor: "item" },
    { header: "Type", accessor: "type" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: (row) => row.quantity ?? "-" },
    { header: "Min-Qty", accessor: (row) => row.minQuantity ?? "-" },
    { header: "Unit Price", accessor: (row) => row.rate ?? "-" },
    { header: "Total Price", accessor: (row) => row.totalPrice ?? "-" },
    { header: "Re-Qty", accessor: (row) => row.reorderQuantity ?? "-" },
    { header: "Shelf No", accessor: (row) => row.shelfNo ?? "-" },
    {
      header: "Status",
      accessor: (row) =>
        row.quantity !== undefined
          ? row.quantity >= 1
            ? "Available"
            : row.quantity === 0
            ? "Not-Avail"
            : "-"
          : "-",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Top Actions */}
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-4">
          <GenericDownloads
            data={filteredMaterials}
            title={`Materials_${site.name}`}
            columns={columns}
          />
          <button
            type="button"
            className="px-3 py-3 text-white bg-cyan-700 rounded hover:bg-cyan-800"
            onClick={() => setShowForm(true)}
            title="Create Material"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <MaterialForm
              warehouseId={siteWarehouseIds[0]}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Materials at “{site.name}”
      </h1>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total", value: total },
          { label: "Available", value: available },
          { label: "Out of Store", value: inactive },
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

      {/* Materials Table */}
      {filteredMaterials.length === 0 ? (
        <p className="text-gray-600">No materials match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Item Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Unit
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Min-Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Unit Price
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Total Price
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Re-Qty
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Shelf No
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((mat, idx) => (
                <tr key={mat.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {"RC00"}
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/materials/${mat.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {mat.item}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.type}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.unit}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.quantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.minQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.rate ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.totalPrice ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.reorderQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {mat.shelfNo ?? "-"}
                  </td>
                  <td
                    className={`${
                      mat.quantity !== undefined && mat.quantity >= 1
                        ? "bg-green-500"
                        : "bg-red-500"
                    } border px-5 text-gray-100`}
                  >
                    {mat.quantity !== undefined
                      ? mat.quantity >= 1
                        ? "Available"
                        : mat.quantity === 0
                        ? "Not-Avail"
                        : "-"
                      : "-"}
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

export default MaterialsPage;
