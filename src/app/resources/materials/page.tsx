"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useMaterials } from "@/hooks/useMaterials";
import { useWarehouses } from "@/hooks/useWarehouses";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { GenericFilter, FilterField } from "@/components/common/GenericFilter";

interface AggregatedRow {
  id: number;
  site: { id: string; name: string };
  totalItems: number;
  outOfStore: number;
  reQty: number;
  responsiblePerson: string;
  status: string;
}

const ResourceMaterialsPage: React.FC = () => {
  // Data hooks
  const { data: materials, isLoading, error } = useMaterials();
  const { data: warehouses, isLoading: whLoading } = useWarehouses();
  const { data: sites, isLoading: siteLoading } = useSites();

  // State for filters, columns, and filtered data
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    status: "",
  });
  const [filteredRows, setFilteredRows] = useState<AggregatedRow[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<
    (keyof AggregatedRow)[]
  >([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Compute aggregated data
  const allRows = useMemo<AggregatedRow[]>(() => {
    if (!materials || !warehouses || !sites) return [];
    const map: Record<string, Omit<AggregatedRow, "id">> = {};
    materials.forEach((mat) => {
      const wh = warehouses.find((w) => w.id === mat.warehouseId);
      const site = wh && sites.find((s) => s.id === wh.siteId);
      if (!site || !wh) return;
      if (!map[site.id]) {
        map[site.id] = {
          site,
          totalItems: 0,
          outOfStore: 0,
          reQty: 0,
          responsiblePerson: wh.owner || "Unknown Owner",
          status: wh.status || "Unknown Status",
        };
      }
      map[site.id].totalItems += 1;
      if (mat.status === "Available") map[site.id].outOfStore += 1;
    });
    return Object.values(map).map((item, idx) => ({
      id: idx + 1,
      site: item.site,
      totalItems: item.totalItems,
      outOfStore: item.outOfStore,
      reQty: item.totalItems - item.outOfStore,
      responsiblePerson: item.responsiblePerson,
      status: item.status,
    }));
  }, [materials, warehouses, sites]);

  // Initialize selected columns once
  useEffect(() => {
    const cols = Object.keys({
      id: "",
      site: "",
      totalItems: "",
      outOfStore: "",
      reQty: "",
      responsiblePerson: "",
      status: "",
    }) as (keyof AggregatedRow)[];
    setSelectedColumns(cols);
  }, []);

  // Update filtered rows when data or filters change
  useEffect(() => {
    let result = allRows;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter((r) => r.site.name.toLowerCase().includes(term));
    }
    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }
    setFilteredRows(result);
  }, [filters, allRows]);

  // Close column menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Handlers
  const toggleColumn = (col: keyof AggregatedRow) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  // Column definitions
  const columnOptions: Record<keyof AggregatedRow, string> = {
    id: "ID",
    site: "Warehouse Site",
    totalItems: "Total Item",
    outOfStore: "Out of Store",
    reQty: "Re-Qty",
    responsiblePerson: "Responsible Person",
    status: "Status",
  };

  // Filter fields
  const filterFields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "text",
      placeholder: "Search by site name...",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select status...",
      options: Array.from(new Set(allRows.map((r) => r.status))).map((s) => ({
        label: s,
        value: s,
      })),
    },
  ];

  // Download columns
  const downloadColumns: Column<AggregatedRow>[] = [
    { header: "ID", accessor: "id" },
    { header: "Warehouse Site", accessor: (row) => row.site.name },
    { header: "Total Items", accessor: "totalItems" },
    { header: "Out of Store", accessor: "outOfStore" },
    { header: "Re-Qty", accessor: "reQty" },
    { header: "Responsible Person", accessor: "responsiblePerson" },
    { header: "Status", accessor: "status" },
  ];

  // Render loading and error states AFTER all hooks
  if (isLoading || whLoading || siteLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading materials.</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
        <nav aria-label="breadcrumb" className="w-full sm:w-auto">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-primary hover:text-primary/90 font-bold transition-colors">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground font-bold">/</li>
            <li className="text-foreground font-black uppercase tracking-wider">Materials</li>
          </ol>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Items", value: materials?.length },
          {
            label: "Out of Store",
            value: allRows.reduce((sum, r) => sum + r.outOfStore, 0),
          },
          {
            label: "Re-Qty",
            value: allRows.reduce((sum, r) => sum + r.reQty, 0),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">{item.label}</p>
              <h2 className="text-3xl font-black text-foreground">{item.value}</h2>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <div className="w-6 h-6 bg-primary rounded-full opacity-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <GenericDownloads
          data={filteredRows}
          title="Materials"
          columns={downloadColumns}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <div ref={menuRef} className="relative w-full lg:w-auto">
            <button
              onClick={() => setShowColumnMenu((v) => !v)}
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
                      checked={selectedColumns.includes(
                        key as keyof AggregatedRow
                      )}
                      onChange={() => toggleColumn(key as keyof AggregatedRow)}
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
              onFilterChange={(vals) => setFilters(vals as Record<string, string>)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-border border border-border">
          <thead className="bg-primary">
            <tr>
              {selectedColumns.includes("id") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  ID
                </th>
              )}
              {selectedColumns.includes("site") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  Warehouse Site
                </th>
              )}
              {selectedColumns.includes("totalItems") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  Total Item
                </th>
              )}
              {selectedColumns.includes("outOfStore") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  Out of Store
                </th>
              )}
              {selectedColumns.includes("reQty") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  Re-Qty
                </th>
              )}
              {selectedColumns.includes("responsiblePerson") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  Responsible Person
                </th>
              )}
              {selectedColumns.includes("status") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider border border-border">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-accent">
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 border border-border">
                      {row.id}
                    </td>
                  )}
                  {selectedColumns.includes("site") && (
                    <td className="px-4 py-2 border border-border">
                      <Link
                        href={`/resources/materials/${row.site.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {row.site.name}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("totalItems") && (
                    <td className="px-4 py-2 border border-border">
                      {row.totalItems}
                    </td>
                  )}
                  {selectedColumns.includes("outOfStore") && (
                    <td className="px-4 py-2 border border-border">
                      {row.outOfStore}
                    </td>
                  )}
                  {selectedColumns.includes("reQty") && (
                    <td className="px-4 py-2 border border-border">
                      {row.reQty}
                    </td>
                  )}
                  {selectedColumns.includes("responsiblePerson") && (
                    <td className="px-4 py-2 border border-border">
                      {row.responsiblePerson}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-border">
                      {row.status}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-2 text-center border border-border"
                >
                  No materials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceMaterialsPage;
