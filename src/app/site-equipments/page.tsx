"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { useCreateEquipment } from "@/hooks/useEquipments"; 
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import {
  Equipment,
  CreateEquipmentInput,
  LooseEquipmentInput,
} from "@/types/equipment";
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
import EquipmentForm from "@/components/forms/EquipmentForm";
import { getDuration } from "@/utils/helper";
import { toast } from "react-toastify";

const EquipmentsPage = () => {
  const { user } = useAuthStore();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const siteId = user!.siteId;

  const {
    data: equipments,
    isLoading: eqLoading,
    error: eqError,
  } = useEquipments();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();

  const [showForm, setShowForm] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const { mutateAsync: createEquipmentAsync } = useCreateEquipment(() => {});

  const canCreate = hasPermission("equipments", "create");
  const canManage = hasPermission("equipments", "manage");

  // find current site
  const site = sites?.find((s) => s.id === siteId);

  // filter equipments by site with memoization
  const siteEquipment = useMemo(
    () => equipments?.filter((e) => e.siteId === siteId) ?? [],
    [equipments, siteId]
  );

  // filtered list based on filters
  const filteredEquipment = useMemo(
    () =>
      siteEquipment.filter((e) =>
        Object.entries(filterValues).every(([key, value]) => {
          if (!value) return true;
          if (key === "owner") {
            return e.owner === value;
          }
          if (key === "status") {
            return e.status === value;
          }
          if (key === "item") {
            return e.item
              .toLowerCase()
              .includes((value as string).toLowerCase());
          }
          return true;
        })
      ),
    [filterValues, siteEquipment]
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
    { header: "Qty", accessor: (row: Equipment) => row.quantity ?? 0 },
    {
      header: "Est Hours",
      accessor: (row: Equipment) => row.estimatedHours ?? 0,
    },
    { header: "Rate", accessor: (row: Equipment) => row.rate ?? 0 },
    {
      header: "Total Amount",
      accessor: (row: Equipment) => row.totalAmount ?? 0,
    },
    { header: "OT", accessor: (row: Equipment) => row.overTime ?? 0 },
    { header: "Condition", accessor: (row: Equipment) => row.condition || "-" },
    { header: "Owner", accessor: (row: Equipment) => row.owner || "-" },
    {
      header: "Duration",
      accessor: (row: Equipment) =>
        row.startingDate && row.dueDate
          ? String(getDuration(row.startingDate, row.dueDate))
          : "-",
    },
    {
      header: "Starting Date",
      accessor: (row: Equipment) =>
        row.startingDate
          ? new Date(row.startingDate).toISOString().split("T")[0]
          : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Equipment) =>
        row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "-",
    },
    { header: "Status", accessor: (row: Equipment) => row.status || "-" },
  ];

  const importColumns: ImportColumn<LooseEquipmentInput>[] = [
    { header: "Item", accessor: "item", type: "string" },
    { header: "Type", accessor: "type", type: "string" },
    { header: "Unit", accessor: "unit", type: "string" },
    { header: "Manufacturer", accessor: "manufacturer", type: "string" },
    { header: "Model", accessor: "model", type: "string" },
    { header: "Year", accessor: "year", type: "string" },
    { header: "Qty", accessor: "quantity", type: "string" },
    { header: "Est Hours", accessor: "estimatedHours", type: "string" },
    { header: "Rate", accessor: "rate", type: "string" },
    { header: "Total Amount", accessor: "totalAmount", type: "string" },
    { header: "OT", accessor: "overTime", type: "string" },
    { header: "Condition", accessor: "condition", type: "string" },
    { header: "Owner", accessor: "owner", type: "string" },
    { header: "Status", accessor: "status", type: "string" },
  ];

  const requiredAccessors: (keyof LooseEquipmentInput)[] = ["item", "unit"];

  const ownerOptions: Option<string>[] = [
    { label: "Raycon", value: "Raycon" },
    { label: "Rental", value: "Rental" },
  ];

  const statusOptions: Option<string>[] = [
    { label: "Available", value: "Available" },
    { label: "Unavailable", value: "Unavailable" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "item",
      label: "Item",
      type: "text",
      placeholder: "Search by item…",
    },
    {
      name: "owner",
      label: "All Owners",
      type: "select",
      options: ownerOptions,
    },
    {
      name: "status",
      label: "All Statuses",
      type: "select",
      options: statusOptions,
    },
  ];

  const processEquipmentData = (
    data: LooseEquipmentInput[]
  ): CreateEquipmentInput[] => {
    return data.map((equipmentRow) => {
      const processed: Record<string, unknown> = { ...equipmentRow, siteId };

      const numberFields: (keyof CreateEquipmentInput)[] = [
        "quantity",
        "estimatedHours",
        "rate",
        "totalAmount",
        "overTime",
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

      return processed as unknown as CreateEquipmentInput;
    });
  };

  const handleImport = async (data: LooseEquipmentInput[]) => {
    try {
      const processedData = processEquipmentData(data);

      const validOwners = ["Raycon", "Rental"];
      const validStatuses = ["Available", "Unavailable"];

      for (let i = 0; i < processedData.length; i++) {
        const equipment = processedData[i];
        if (equipment.owner && !validOwners.includes(equipment.owner)) {
          toast.error(
            `Invalid owner in row ${i + 2}. Must be one of: ${validOwners.join(
              ", "
            )}`
          );
          return;
        }
        if (equipment.status && !validStatuses.includes(equipment.status)) {
          toast.error(
            `Invalid status in row ${
              i + 2
            }. Must be one of: ${validStatuses.join(", ")}`
          );
          return;
        }
      }

      await Promise.all(
        processedData.map((equipment) => createEquipmentAsync(equipment))
      );
      toast.success("Equipments imported and created successfully!");
    } catch (error) {
      toast.error("Error importing and creating equipments");
      console.error("Import error:", error);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <nav className="hidden md:block" aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm sm:text-base">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Equipments</li>
          </ol>
        </nav>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
          {canCreate && (
            <button
              type="button"
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
              onClick={() => setShowForm(true)}
              title="Create Equipment"
            >
              <span className="md:hidden">Add New</span>
              <Plus className="w-4 h-4 hidden md:inline" />
            </button>
          )}
          {canManage && (
            <div className="w-full md:w-auto mt-2 md:mt-0">
              <GenericDownloads
                data={filteredEquipment}
                title={`Equipments_${site.name}`}
                columns={columns}
              />
            </div>
          )}
        </div>
      </div>

      {/* Import */}
      <div className="flex justify-end mb-4">
        {canManage && (
          <GenericImport<LooseEquipmentInput>
            expectedColumns={importColumns}
            requiredAccessors={requiredAccessors}
            onImport={handleImport}
            title="Equipments"
            onError={handleError}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && canCreate && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EquipmentForm siteId={siteId} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Equipment at &quot;{site.name}&quot;
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
              {filteredEquipment.map((eq, idx) => {
                const isAvailable = eq.status === "Available";
                return (
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
                      {eq.quantity ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.estimatedHours ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.rate ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.totalAmount ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.overTime ?? 0}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.condition || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.owner || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.startingDate && eq.dueDate
                        ? getDuration(eq.startingDate, eq.dueDate)
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.startingDate
                        ? new Date(eq.startingDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {eq.dueDate
                        ? new Date(eq.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      <Badge
                        className={`${
                          isAvailable
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white`}
                      >
                        {eq.status}
                      </Badge>
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

export default EquipmentsPage;
