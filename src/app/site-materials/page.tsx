"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useCreateMaterial } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import {
  Material,
  CreateMaterialInput,
  LooseMaterialInput,
} from "@/types/material";
import { Warehouse } from "@/types/warehouse";
import { Site } from "@/types/site";
import MaterialForm from "@/components/forms/MaterialForm";
import { useAuthStore } from "@/store/authStore";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import GenericImport, { ImportColumn } from "@/components/common/GenericImport";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

const MaterialsPage = () => {
  const { user } = useAuthStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const siteId = user?.siteId;
  const [showForm, setShowForm] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

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

  const { mutateAsync: createMaterialAsync } = useCreateMaterial(() => {});

  const canCreate = hasPermission("materials", "create");
  const canManage = hasPermission("materials", "manage");

  // Find current site
  const site: Site | undefined = sites?.find((s) => s.id === siteId);

  // Memoize siteWarehouseIds
  const siteWarehouseIds = useMemo(
    () =>
      warehouses
        ?.filter((w: Warehouse) => w.siteId === siteId)
        .map((w) => w.id) ?? [],
    [warehouses, siteId]
  );

  // Memoize siteMaterials to prevent recalculation on every render
  const siteMaterials = useMemo(
    () =>
      materials?.filter(
        (m) => m.warehouseId && siteWarehouseIds.includes(m.warehouseId)
      ) ?? [],
    [materials, siteWarehouseIds]
  );

  // Filtered list based on filters
  const filteredMaterials = useMemo(
    () =>
      siteMaterials.filter((m) =>
        Object.entries(filterValues).every(([key, value]) => {
          if (!value) return true;
          if (key === "type") {
            return m.type === value;
          }
          if (key === "item") {
            return m.item
              .toLowerCase()
              .includes((value as string).toLowerCase());
          }
          return true;
        })
      ),
    [filterValues, siteMaterials]
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
    { header: "Qty", accessor: (row) => row.quantity ?? 0 },
    { header: "Min-Qty", accessor: (row) => row.minQuantity ?? 0 },
    { header: "Unit Price", accessor: (row) => row.rate ?? 0 },
    { header: "Total Price", accessor: (row) => row.totalPrice ?? 0 },
    { header: "Re-Qty", accessor: (row) => row.reorderQuantity ?? 0 },
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

  const importColumns: ImportColumn<LooseMaterialInput>[] = [
    { header: "Item Name", accessor: "item", type: "string" },
    { header: "Type", accessor: "type", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Qty", accessor: "quantity", type: "string" },
    { header: "Min-Qty", accessor: "minQuantity", type: "string" },
    { header: "Unit Price", accessor: "rate", type: "string" },
    { header: "Re-Qty", accessor: "reorderQuantity", type: "string" },
    { header: "Shelf No", accessor: "shelfNo", type: "string" },
  ];

  const requiredAccessors: (keyof LooseMaterialInput)[] = [
    "item",
    "type",
    "unit",
  ];

  const typeOptions: Option<string>[] = [
    { label: "Raw", value: "Raw" },
    { label: "Semi-Finished", value: "Semi-Finished" },
    { label: "Finished", value: "Finished" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "item",
      label: "Item Name",
      type: "text",
      placeholder: "Search by item…",
    },
    {
      name: "type",
      label: "All Types",
      type: "select",
      options: typeOptions,
    },
  ];

  const processMaterialData = (
    data: LooseMaterialInput[]
  ): CreateMaterialInput[] => {
    return data.map((materialRow) => {
      const processed: Record<string, unknown> = { ...materialRow };

      const numberFields: (keyof CreateMaterialInput)[] = [
        "quantity",
        "minQuantity",
        "rate",
        "reorderQuantity",
      ];
      numberFields.forEach((field) => {
        const val = processed[field];
        if (val === "-" || val === "" || val == null) {
          processed[field] = undefined;
        } else {
          const num = Number(val);
          processed[field] = isNaN(num) ? undefined : num;
        }
      });

      if (processed.minQuantity === undefined) {
        processed.minQuantity = 1;
      }

      return processed as unknown as CreateMaterialInput;
    });
  };

  const handleImport = async (data: LooseMaterialInput[]) => {
    try {
      const processedData = processMaterialData(data);

      await Promise.all(
        processedData.map((material) =>
          createMaterialAsync({ ...material, warehouseId: siteWarehouseIds[0] })
        )
      );
      toast.success("Materials imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating materials");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <nav className="hidden md:block" aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm sm:text-base">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Materials</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {canCreate && (
            <button
              type="button"
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
              onClick={() => setShowForm(true)}
              title="Create Material"
            >
              <span className="md:hidden">Add New</span>
              <Plus className="w-4 h-4 hidden md:inline" />
            </button>
          )}
          {canManage && (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <GenericDownloads
                data={filteredMaterials}
                title={`Materials_${site.name}`}
                columns={columns}
              />
            </div>
          )}
        </div>
      </div>

      {/* Import */}
      <div className="flex justify-end mb-4">
        {canManage && (
          <GenericImport<LooseMaterialInput>
            expectedColumns={importColumns}
            requiredAccessors={requiredAccessors}
            onImport={handleImport}
            title="Materials"
            onError={handleError}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && canCreate && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <MaterialForm
              warehouseId={siteWarehouseIds[0]}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Materials at &quot;{site.name}&quot;
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
              {filteredMaterials.map((mat, idx) => {
                const statusText =
                  mat.quantity !== undefined
                    ? mat.quantity >= 1
                      ? "Available"
                      : "Not-Avail"
                    : "-";
                const isAvailable = statusText === "Available";
                const showDash = statusText === "-";
                return (
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
                      {mat.quantity ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.minQuantity ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.rate ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.totalPrice ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.reorderQuantity ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {mat.shelfNo ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {showDash ? (
                        "-"
                      ) : (
                        <Badge
                          className={`${
                            isAvailable
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white`}
                        >
                          {statusText}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
