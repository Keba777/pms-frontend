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

  const { mutateAsync: createMaterialAsync } = useCreateMaterial(() => { });

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
                  <span className="text-gray-900">Materials</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
              Materials at &quot;{site.name}&quot;
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
              Inventory management and tracking for site materials
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
                  data={filteredMaterials}
                  title={`Materials_${site.name}`}
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
              <GenericImport<LooseMaterialInput>
                expectedColumns={importColumns}
                requiredAccessors={requiredAccessors}
                onImport={handleImport}
                title="Materials"
                onError={handleError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Items", value: total, color: "text-cyan-700", bg: "bg-cyan-50" },
          { label: "Available", value: available, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Out of Store", value: inactive, color: "text-rose-700", bg: "bg-rose-50" },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} p-4 rounded-2xl border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No materials match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "ID", "Item Name", "Type", "Unit", "Qty", "Min-Qty", "Unit Price", "Total Price", "Re-Qty", "Shelf No", "Status", "Action"].map((head) => (
                    <th key={head} className="px-4 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredMaterials.map((mat, idx) => {
                  const statusText = mat.quantity !== undefined ? (mat.quantity >= 1 ? "Available" : "Not-Avail") : "-";
                  const isAvailable = statusText === "Available";
                  return (
                    <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-black text-gray-300">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-4 py-4 text-sm font-bold text-gray-400">RC{String(idx + 1).padStart(3, '0')}</td>
                      <td className="px-4 py-4">
                        <Link href={`/resources/materials/${mat.id}`} className="text-sm font-black text-cyan-700 hover:text-cyan-800 transition-colors">
                          {mat.item}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{mat.type}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-medium">{mat.unit}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900">{mat.quantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 font-medium">{mat.minQuantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-mono">${(mat.rate ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900 font-mono">${(mat.totalPrice ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 font-medium">{mat.reorderQuantity ?? 0}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 italic">{mat.shelfNo ?? "-"}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black uppercase bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-all shadow-sm">
                            Action <ChevronDown className="w-3 h-3" />
                          </MenuButton>
                          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-[9999] py-1 backdrop-blur-sm bg-white/95">
                            {[
                              { label: "View Details", href: `/resources/materials/${mat.id}` },
                              { label: "Edit Item", action: () => console.log("Edit clicked") },
                              { label: "Manage Inventory", action: () => console.log("Manage clicked") },
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
              <h3 className="text-lg sm:text-xl font-black text-cyan-800 uppercase tracking-tight">Add New Material</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <MaterialForm
                warehouseId={siteWarehouseIds[0]}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
