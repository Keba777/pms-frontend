"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { useSites } from "@/hooks/useSites";
import { Equipment } from "@/types/equipment";
import { Site } from "@/types/site";
import { getDuration } from "@/utils/helper";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";

const statusBadgeClasses: Record<Equipment["status"], string> = {
  Available: "bg-primary/20 text-primary",
  Unavailable: "bg-destructive/10 text-destructive",
};

const columnOptions: Record<string, string> = {
  id: "ID",
  item: "Item",
  type: "Type",
  unit: "Unit",
  manufacturer: "Manufacturer",
  model: "Model",
  year: "Year",
  quantity: "Qty",
  estimatedHours: "Est Hours",
  rate: "Rate",
  totalAmount: "Total Amount",
  overTime: "OT",
  condition: "Condition",
  owner: "Owner",
  duration: "Duration",
  startingDate: "Starting Date",
  dueDate: "Due Date",
  status: "Status",
};

export default function EquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;
  const {
    data: equipments,
    isLoading: eqLoading,
    error: eqError,
  } = useEquipments();
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

  // Get site data
  const site: Site | undefined = sites?.find((s) => s.id === siteId);

  // Filter equipments by siteId and filter values
  const filteredEquipments = useMemo(() => {
    const siteEquipment: Equipment[] =
      equipments?.filter((e) => e.siteId === siteId) ?? [];

    return siteEquipment.filter((e: Equipment) => {
      let matches = true;
      if (filterValues.item) {
        matches =
          matches &&
          e.item
            .toLowerCase()
            .includes((filterValues.item as string).toLowerCase());
      }
      if (filterValues.status) {
        matches = matches && e.status === filterValues.status;
      }
      return matches;
    });
  }, [filterValues, equipments, siteId]);

  // Early returns after all Hooks
  if (eqLoading || siteLoading) return <div className="p-10 text-center text-primary font-bold">Loading...</div>;
  if (eqError || siteError)
    return <div className="text-destructive font-bold p-10 text-center">Error loading data.</div>;
  if (!site) {
    return (
      <div className="text-center text-destructive font-bold mt-10">Site not found.</div>
    );
  }

  // Status summary values
  const total = filteredEquipments?.length ?? 0;
  const available =
    filteredEquipments?.filter((l) => l.status === "Available").length ?? 0;
  const unavailable =
    filteredEquipments?.filter((l) => l.status === "Unavailable").length ?? 0;
  const rental =
    filteredEquipments?.filter((l) => l.owner === "Rental").length ?? 0;
  const own =
    filteredEquipments?.filter((l) => l.owner === "Raycon").length ?? 0;

  // Define download columns
  const columns: Column<Equipment>[] = [
    { header: "ID", accessor: (row: Equipment) => row.id },
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
          ? getDuration(row.createdAt, row.updatedAt)
          : "-",
    },
    {
      header: "Starting Date",
      accessor: (row: Equipment) =>
        row.startingDate
          ? new Date(row.startingDate).toLocaleDateString()
          : "-",
    },
    {
      header: "Due Date",
      accessor: (row: Equipment) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-",
    },
    { header: "Status", accessor: (row: Equipment) => row.status || "-" },
  ];

  // Filter options
  const statusOptions: Option<string>[] = [
    { label: "Allocated", value: "Allocated" },
    { label: "Unallocated", value: "Unallocated" },
    { label: "On Maintainance", value: "OnMaintainance" },
    { label: "Inactive", value: "InActive" },
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
          onClick={() => router.push("/resources/equipments")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Sites
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
          Equipment at "{site.name}"
        </h1>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: total },
          { label: "Available", value: available },
          { label: "Unavailable", value: unavailable },
          { label: "Rental", value: rental },
          { label: "Own", value: own },
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
          data={filteredEquipments}
          title={`Equipment_${site.name}`}
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
              <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2 max-h-[400px] overflow-y-auto no-scrollbar">
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

      {filteredEquipments.length === 0 ? (
        <p className="text-muted-foreground">No equipment found for this site.</p>
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
                    Item
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
                {selectedColumns.includes("manufacturer") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Manufacturer
                  </th>
                )}
                {selectedColumns.includes("model") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Model
                  </th>
                )}
                {selectedColumns.includes("year") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Year
                  </th>
                )}
                {selectedColumns.includes("quantity") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Qty
                  </th>
                )}
                {selectedColumns.includes("estimatedHours") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Est Hours
                  </th>
                )}
                {selectedColumns.includes("rate") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Rate
                  </th>
                )}
                {selectedColumns.includes("totalAmount") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Total Amount
                  </th>
                )}
                {selectedColumns.includes("overTime") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    OT
                  </th>
                )}
                {selectedColumns.includes("condition") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Condition
                  </th>
                )}
                {selectedColumns.includes("owner") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Owner
                  </th>
                )}

                {selectedColumns.includes("createdAt") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Starting Date
                  </th>
                )}
                {selectedColumns.includes("updatedAt") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Due Date
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
              {filteredEquipments.map((eq, idx) => (
                <tr key={eq.id}>
                  <td className="px-4 py-2 border border-border">
                    {idx + 1}
                  </td>
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 border border-border">
                      {`EQ00${idx + 1}`}
                    </td>
                  )}
                  {selectedColumns.includes("item") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.item}
                    </td>
                  )}
                  {selectedColumns.includes("type") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.type || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("unit") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.unit}
                    </td>
                  )}
                  {selectedColumns.includes("manufacturer") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.manufacturer || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("model") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.model || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("year") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.year || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("quantity") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.quantity ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("estimatedHours") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.estimatedHours ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("rate") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.rate ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("totalAmount") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.totalAmount ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("overTime") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.overTime ?? "-"}
                    </td>
                  )}
                  {selectedColumns.includes("condition") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.condition || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("owner") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.owner || "-"}
                    </td>
                  )}

                  {selectedColumns.includes("createdAt") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.startingDate
                        ? new Date(eq.startingDate).toLocaleDateString()
                        : "-"}
                    </td>
                  )}
                  {selectedColumns.includes("updatedAt") && (
                    <td className="px-4 py-2 border border-border">
                      {eq.dueDate
                        ? new Date(eq.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-border">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[eq.status]
                          }`}
                      >
                        {eq.status || "-"}
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
