"use client";

import React, { useState } from "react";
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

const MaterialsPage = () => {
  const { user } = useAuthStore();
  const siteId = user?.siteId;
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
  const [showForm, setShowForm] = useState(false);

  if (matLoading || whLoading || siteLoading) return <div>Loading...</div>;
  if (matError || whError || siteError)
    return <div className="text-red-500">Error loading data.</div>;

  const site: Site | undefined = sites?.find((s) => s.id === siteId);
  if (!site) {
    return (
      <div className="text-center text-red-500 mt-10">Site not found.</div>
    );
  }

  // get all warehouses at this site
  const siteWarehouseIds =
    warehouses
      ?.filter((w: Warehouse) => w.siteId === siteId)
      .map((w) => w.id) ?? [];

  // then filter materials stored in those warehouses
  const siteMaterials: Material[] =
    materials?.filter(
      (m) => m.warehouseId && siteWarehouseIds.includes(m.warehouseId)
    ) ?? [];

  const total = siteMaterials?.length ?? 0;
  const available = siteMaterials.filter(
    (l) => l.quantity !== undefined && l.quantity >= 1
  ).length;

  // siteMaterials?.filter((l) => l.status === "Active").length ?? 0;

  const inactive = siteMaterials.filter((l) => l.quantity === 0).length;
  // siteMaterials?.filter((l) => l.status === "Inactive").length ?? 0;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          className="px-3 py-3 text-white bg-cyan-700 rounded hover:bg-cyan-800"
          onClick={() => setShowForm(true)}
          title="Create Material"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

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
            <div className="flex items-center">
              <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {siteMaterials.length === 0 ? (
        <p className="text-gray-600">No materials found for this site.</p>
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
                  Re‑Qty
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
              {siteMaterials.map((mat, idx) => (
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
                        ? "bg-green-500 border px-5 "
                        : "bg-red-500 px-5"
                    }  border border-gray-200 text-gray-100`}
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
                              // onClick={() => handleView(project.id)}
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
                              // onClick={() => {
                              //   setProjectToEdit({
                              //     ...project,
                              //     members: project.members?.map(
                              //       (m) => m.id
                              //     ),
                              //   });
                              //   setShowForm(true);
                              // }}
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
                              // onClick={() =>

                              // }
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
                              className={`${
                                active ? "bg-gray-100" : ""
                              } w-full text-left px-3 py-2 text-sm text-gray-700`}
                              onClick={() => console.log("Manage clicked")}
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
