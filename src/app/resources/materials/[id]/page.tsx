"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import { Material } from "@/types/material";
import { Warehouse } from "@/types/warehouse";
import { Site } from "@/types/site";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";

const statusBadgeClasses: Record<Material["status"], string> = {
  Available: "bg-primary/20 text-primary",
  Unavailable: "bg-destructive/10 text-destructive",
};

const columnOptions: Record<string, string> = {
  id: "ID",
  item: "Item Name",
  type: "Type",
  unit: "Unit",
  quantity: "Qty",
  totalPrice: "Unit Price",
  reorderQuantity: "Re-Qty",
  shelfNo: "Shelf No",
  status: "Status",
};

export default function MaterialPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;
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

  // Column selection state
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Close column menu when clicking outside
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    });
    return () => document.removeEventListener("mousedown", () => { });
  }, []);

  const site: Site | undefined = sites?.find((s) => s.id === siteId);
  const siteWarehouseIds = useMemo(() => {
    return (
      warehouses
        ?.filter((w: Warehouse) => w.siteId === siteId)
        .map((w) => w.id) ?? []
    );
  }, [warehouses, siteId]);

  // Filter materials stored in those warehouses
  const filteredMaterials = useMemo(() => {
    const siteMaterials: Material[] =
      materials?.filter(
        (m) => m.warehouseId && siteWarehouseIds.includes(m.warehouseId)
      ) ?? [];

    return siteMaterials.filter((m: Material) => {
      let matches = true;
      if (filterValues.item) {
        matches =
          matches &&
          m.item
            .toLowerCase()
            .includes((filterValues.item as string).toLowerCase());
      }
      if (filterValues.status) {
        matches = matches && m.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, materials, siteWarehouseIds]);

  // Early returns after all Hooks
  if (matLoading || whLoading || siteLoading) return <div className="p-10 text-center text-primary font-bold">Loading...</div>;
  if (matError || whError || siteError)
    return <div className="text-destructive font-bold p-10 text-center">Error loading data.</div>;
  if (!site) {
    return (
      <div className="text-center text-destructive font-bold mt-10">Site not found.</div>
    );
  }

  // Status summary values
  const total = filteredMaterials?.length ?? 0;
  const allocated =
    filteredMaterials?.filter((l) => l.status === "Available").length ?? 0;
  const unallocated =
    filteredMaterials?.filter((l) => l.status === "Unavailable").length ?? 0;

  // Define download columns
  const columns: Column<Material>[] = [
    { header: "ID", accessor: (row: Material) => row.id },
    { header: "Item Name", accessor: "item" },
    { header: "Type", accessor: (row: Material) => row.type || "-" },
    { header: "Unit", accessor: "unit" },
    { header: "Qty", accessor: (row: Material) => row.quantity ?? "-" },
    {
      header: "Unit Price",
      accessor: (row: Material) => row.totalPrice ?? "-",
    },
    {
      header: "Re-Qty",
      accessor: (row: Material) => row.reorderQuantity ?? "-",
    },
    { header: "Shelf No", accessor: (row: Material) => row.shelfNo ?? "-" },
    { header: "Status", accessor: (row: Material) => row.status ?? "-" },
  ];

  // Filter options
  const statusOptions: Option<string>[] = [
    { label: "Available", value: "Available" },
    { label: "Unavailable", value: "Unavailable" },
  ];

  // Filter fields
  const filterFields: FilterField<string>[] = [
    {
      name: "item",
      label: "Item Name",
      type: "text",
      placeholder: "Search by item name…",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
        <button
          className="flex items-center text-primary hover:text-primary/80 font-bold transition-colors group"
          onClick={() => router.push("/resources/materials")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Sites
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
          Materials at "{site.name}"
        </h1>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total", value: total },
          { label: "Available", value: allocated },
          { label: "Out of Store", value: unallocated },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center items-center text-center group hover:bg-accent transition-all"
          >
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">{item.label}</p>
            <span className="text-2xl font-black text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-8 flex flex-col gap-6">
        <GenericDownloads
          data={filteredMaterials}
          title={`Materials_${site.name}`}
          columns={columns}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <div ref={menuRef} className="relative w-full lg:w-auto">
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-bold text-sm"
            >
              Customize Columns <ChevronDown className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Visible Columns</span>
                </div>
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center w-full px-4 py-2 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key)}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary mr-3"
                    />
                    <span className="text-sm text-foreground font-bold">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="w-full lg:w-auto">
            <GenericFilter
              fields={filterFields}
              onFilterChange={setFilterValues}
            />
          </div>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <p className="text-muted-foreground">No materials found for this site.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border border border-border">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                  #
                </th>
                {selectedColumns.includes("id") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    ID
                  </th>
                )}
                {selectedColumns.includes("item") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Item Name
                  </th>
                )}
                {selectedColumns.includes("type") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Type
                  </th>
                )}
                {selectedColumns.includes("unit") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Unit
                  </th>
                )}
                {selectedColumns.includes("quantity") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Qty
                  </th>
                )}
                {selectedColumns.includes("totalPrice") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Unit Price
                  </th>
                )}
                {selectedColumns.includes("reorderQuantity") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Re-Qty
                  </th>
                )}
                {selectedColumns.includes("shelfNo") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Shelf No
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Status
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredMaterials.map((mat, idx) => (
                <tr key={mat.id}>
                  <td className="px-4 py-2 border border-border">
                    {idx + 1}
                  </td>
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 border border-border">
                      {`RC00${idx + 1}`}
                    </td>
                  )}
                  {selectedColumns.includes("item") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.item}
                    </td>
                  )}
                  {selectedColumns.includes("type") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.type || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.unit}
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.quantity ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("totalPrice") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.totalPrice ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("reorderQuantity") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.reorderQuantity ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("shelfNo") && (
                    <td className="px-4 py-2 border border-border">
                      {mat.shelfNo ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-border">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[mat.status]
                          }`}
                      >
                        {mat.status || "-"}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
