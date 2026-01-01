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
import { formatDate as format } from "@/utils/dateUtils";
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

  const { mutateAsync: createEquipmentAsync } = useCreateEquipment(() => { });

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
            `Invalid status in row ${i + 2
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
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                <li className="flex items-center space-x-2">
                  <span>/</span>
                  <span className="text-gray-900">Equipments</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
              Equipment at &quot;{site.name}&quot;
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
              Asset tracking and utilization for site equipment
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canCreate && (
              <button
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-cyan-700 text-white rounded-xl hover:bg-cyan-800 transition-all shadow-md shadow-cyan-200"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
            {canManage && (
              <div className="flex-1 sm:flex-none">
                <GenericDownloads
                  data={filteredEquipment}
                  title={`Equipments_${site.name}`}
                  columns={columns}
                />
              </div>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-4 border-t border-gray-200/60">
          <div className="w-full lg:max-w-2xl">
            <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
          </div>
          <div className="flex items-center justify-end gap-2">
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
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Assets", value: total, color: "text-cyan-700", bg: "bg-cyan-50" },
          { label: "Available", value: available, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Unavailable", value: unavailable, color: "text-rose-700", bg: "bg-rose-50" },
          { label: "Rental", value: rental, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Raycon Owned", value: own, color: "text-indigo-700", bg: "bg-indigo-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} p-4 rounded-2xl border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No equipment match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
                  {[
                    "Item", "Type", "Unit", "Manufacturer", "Model", "Year", "Qty",
                    "Est Hours", "Rate", "Total", "OT", "Condition", "Owner",
                    "Duration", "Starting", "Due", "Status", "Action"
                  ].map((head) => (
                    <th key={head} className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredEquipment.map((eq, idx) => {
                  const isAvailable = eq.status === "Available";
                  return (
                    <tr key={eq.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-black text-gray-300">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-4 py-4">
                        <Link href={`/resources/equipment/${eq.id}`} className="text-sm font-black text-cyan-700 hover:text-cyan-800 transition-colors">
                          {eq.item}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-medium">{eq.type || "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{eq.unit}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{eq.manufacturer || "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 uppercase font-bold">{eq.model || "-"}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-mono font-bold">{eq.year || "-"}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900">{eq.quantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{eq.estimatedHours ?? 0}h</td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-mono">${(eq.rate ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900 font-mono">${(eq.totalAmount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{eq.overTime ?? 0}h</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${eq.condition === 'New' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {eq.condition || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${eq.owner === 'Raycon' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {eq.owner || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-medium">
                        {eq.startingDate && eq.dueDate ? `${getDuration(eq.startingDate, eq.dueDate)}d` : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 italic">
                        {eq.startingDate ? format(eq.startingDate) : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 italic">
                        {eq.dueDate ? format(eq.dueDate) : "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm whitespace-nowrap">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-all shadow-sm">
                            Action <ChevronDown className="w-3 h-3" />
                          </MenuButton>
                          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-[9999] py-1 backdrop-blur-sm bg-white/95">
                            {[
                              { label: "View Details", href: `/resources/equipment/${eq.id}` },
                              { label: "Edit Item", action: () => console.log("Edit clicked") },
                              { label: "Manage Maintenance", action: () => console.log("Manage clicked") },
                              { label: "Delete", action: () => console.log("Delete clicked"), color: "text-rose-600" }
                            ].map((item) => (
                              <MenuItem key={item.label}>
                                {({ active }) => (
                                  item.href ? (
                                    <Link
                                      href={item.href}
                                      className={`block w-full px-4 py-2 text-left text-xs font-bold text-gray-700 ${active ? "bg-gray-50 text-cyan-700" : ""
                                        }`}
                                    >
                                      {item.label}
                                    </Link>
                                  ) : (
                                    <button
                                      className={`block w-full px-4 py-2 text-left text-xs font-bold ${item.color || 'text-gray-700'} ${active ? "bg-gray-50 text-cyan-700" : ""
                                        }`}
                                      onClick={item.action}
                                    >
                                      {item.label}
                                    </button>
                                  )
                                )}
                              </MenuItem>
                            ))}
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

      {/* Form Modal */}
      {showForm && canCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg sm:text-xl font-black text-cyan-800 uppercase tracking-tight">Add New Equipment</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <EquipmentForm siteId={siteId as string} onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentsPage;
