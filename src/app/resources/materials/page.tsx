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
  const [filters, setFilters] = useState<Record<string, string>>({ search: "", status: "" });
  const [filteredRows, setFilteredRows] = useState<AggregatedRow[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<(keyof AggregatedRow)[]>([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Compute aggregated data
  const allRows = useMemo<AggregatedRow[]>(() => {
    if (!materials || !warehouses || !sites) return [];
    const map: Record<string, Omit<AggregatedRow, 'id'>> = {};
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
      if (mat.status === "Active") map[site.id].outOfStore += 1;
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
      id: '', site: '', totalItems: '', outOfStore: '', reQty: '', responsiblePerson: '', status: ''
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
    setSelectedColumns((prev) => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
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
    { name: "search", label: "Search", type: "text", placeholder: "Search by site name..." },
    { name: "status", label: "Status", type: "select", placeholder: "Select status...",
      options: Array.from(new Set(allRows.map(r => r.status))).map(s => ({ label: s, value: s }))
    },
  ];

  // Download columns
  const downloadColumns: Column<AggregatedRow>[] = [
    { header: "ID", accessor: "id" },
    { header: "Warehouse Site", accessor: row => row.site.name },
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
      {/* Breadcrumb */}
      <div className="flex justify-between mb-4 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Materials</li>
          </ol>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total Items", value: allRows.length },
          { label: "Out of Store", value: allRows.reduce((sum, r) => sum + r.outOfStore, 0) },
          { label: "Re-Qty", value: allRows.reduce((sum, r) => sum + r.reQty, 0) },
        ].map(item => (
          <div key={item.label} className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md">
            <h2 className="mr-2">{item.label} =</h2>
            <div className="flex items-center"><span className="text-cyan-700 font-stretch-semi-condensed font-semibold">{item.value}</span></div>
          </div>
        ))}
      </div>

      {/* Downloads */}
      <GenericDownloads data={filteredRows} title="Materials" columns={downloadColumns} />

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <div ref={menuRef} className="relative">
          <button onClick={() => setShowColumnMenu(v => !v)} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label key={key} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                  <input type="checkbox" checked={selectedColumns.includes(key as keyof AggregatedRow)} onChange={() => toggleColumn(key as keyof AggregatedRow)} className="mr-2" />{label}
                </label>
              ))}
            </div>
          )}
        </div>
        <GenericFilter fields={filterFields} onFilterChange={(vals) => setFilters(vals as Record<string, string>)} />
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700"><tr>
            {selectedColumns.includes("id") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">ID</th>}
            {selectedColumns.includes("site") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">Warehouse Site</th>}
            {selectedColumns.includes("totalItems") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">Total Item</th>}
            {selectedColumns.includes("outOfStore") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">Out of Store</th>}
            {selectedColumns.includes("reQty") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">Re-Qty</th>}
            {selectedColumns.includes("responsiblePerson") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">Responsible Person</th>}
            {selectedColumns.includes("status") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">Status</th>}
          </tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.length ? filteredRows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {selectedColumns.includes("id") && <td className="px-4 py-2 border border-gray-200">{row.id}</td>}
                {selectedColumns.includes("site") && <td className="px-4 py-2 border border-gray-200"><Link href={`/resources/materials/${row.site.id}`} className="text-blue-600 hover:underline">{row.site.name}</Link></td>}
                {selectedColumns.includes("totalItems") && <td className="px-4 py-2 border border-gray-200">{row.totalItems}</td>}
                {selectedColumns.includes("outOfStore") && <td className="px-4 py-2 border border-gray-200">{row.outOfStore}</td>}
                {selectedColumns.includes("reQty") && <td className="px-4 py-2 border border-gray-200">{row.reQty}</td>}
                {selectedColumns.includes("responsiblePerson") && <td className="px-4 py-2 border border-gray-200">{row.responsiblePerson}</td>}
                {selectedColumns.includes("status") && <td className="px-4 py-2 border border-gray-200">{row.status}</td>}
              </tr>
            )) : <tr><td colSpan={selectedColumns.length} className="px-4 py-2 text-center border border-gray-200">No materials found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceMaterialsPage;
