"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { ChevronDown } from "lucide-react";
import { useEquipments } from "@/hooks/useEquipments";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { GenericFilter, FilterField } from "@/components/common/GenericFilter";

interface AggregatedRow {
  id: number;
  site: { id: string; name: string };
  total: number;
  available: number;
  unavailable: number;
}

const ResourceEquipmentsPage: React.FC = () => {
  const { data: equipments, isLoading, error } = useEquipments();
  const { data: sites, isLoading: siteLoading } = useSites();

  // 1. Compute aggregated rows
  const allRows = useMemo<AggregatedRow[]>(() => {
    if (!equipments || !sites) return [];
    const map: Record<string, Omit<AggregatedRow, "id">> = {};
    equipments.forEach((eqp) => {
      const site = sites.find((s) => s.id === eqp.siteId);
      if (!site) return;
      if (!map[site.id]) {
        map[site.id] = {
          site,
          total: 0,
          available: 0,
          unavailable: 0,
        };
      }
      map[site.id].total += 1;
      switch (eqp.status) {
        case "Available":
          map[site.id].available += 1;
          break;
        case "Unavailable":
          map[site.id].unavailable += 1;
          break;
      }
    });
    return Object.values(map).map((item, idx) => ({ id: idx + 1, ...item }));
  }, [equipments, sites]);

  // 2. Summary cards
  const summaryData = useMemo(
    () => [
      { label: "Total", value: allRows.reduce((s, r) => s + r.total, 0) },
      {
        label: "Available",
        value: allRows.reduce((s, r) => s + r.available, 0),
      },
      {
        label: "Unavailable",
        value: allRows.reduce((s, r) => s + r.unavailable, 0),
      },
    ],
    [allRows]
  );

  // 3. UI state hooks (always called)
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    status: "",
  });
  const [filteredRows, setFilteredRows] = useState<AggregatedRow[]>(allRows);
  const [selectedColumns, setSelectedColumns] = useState<
    (keyof AggregatedRow)[]
  >([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 4. Initialize selected columns once
  useEffect(() => {
    const cols = Object.keys({
      id: 0,
      site: {},
      total: 0,
      allocated: 0,
      unallocated: 0,
      onMaintainance: 0,
      inactive: 0,
    }) as (keyof AggregatedRow)[];
    setSelectedColumns(cols);
  }, []);

  // 5. Apply filters whenever `filters` or `allRows` change
  useEffect(() => {
    let result = allRows;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter((r) => r.site.name.toLowerCase().includes(term));
    }
    if (filters.status) {
      result = result.filter((r) => {
        const key = filters.status.toLowerCase();
        return (
          r.site.name.toLowerCase().includes(key) ||
          r.total.toString() === filters.status
        );
      });
    }
    setFilteredRows(result);
  }, [filters, allRows]);

  // 6. Close column menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 7. Column toggle callback
  const toggleColumn = useCallback((col: keyof AggregatedRow) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }, []);

  // Column labels
  const columnOptions: Record<keyof AggregatedRow, string> = {
    id: "ID",
    site: "Site Name",
    total: "Total Equipment",
    available: "Available",
    unavailable: "Unavailable",
  };

  // Filter field definitions
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
      options: [
        { label: "Available", value: "Available" },
        { label: "Unavailable", value: "Unavailable" },
      ],
    },
  ];

  // Download columns
  const downloadColumns: Column<AggregatedRow>[] = [
    { header: "ID", accessor: "id" },
    { header: "Site Name", accessor: (row) => row.site.name },
    { header: "Total Equipment", accessor: "total" },
    { header: "Available", accessor: "available" },
    { header: "Unavailable", accessor: "unavailable" },
  ];

  // Now that all hooks are set up, we can safely return early based on loading/error
  if (isLoading || siteLoading) {
    return <div>Loading equipment...</div>;
  }
  if (error) {
    return <div>Error loading equipment.</div>;
  }

  // Final render
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex justify-between mb-4 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Equipments</li>
          </ol>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-4">
        {summaryData.map((item) => (
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

      {/* Downloads */}
      <GenericDownloads
        data={filteredRows}
        title="Equipments"
        columns={downloadColumns}
      />

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(
                      key as keyof AggregatedRow
                    )}
                    onChange={() => toggleColumn(key as keyof AggregatedRow)}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
        <GenericFilter
          fields={filterFields}
          onFilterChange={(vals) => setFilters(vals as Record<string, string>)}
        />
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("id") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">
                  ID
                </th>
              )}
              {selectedColumns.includes("site") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">
                  Site Name
                </th>
              )}
              {selectedColumns.includes("total") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">
                  Total Equipment
                </th>
              )}
              {selectedColumns.includes("available") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">
                  Available
                </th>
              )}
              {selectedColumns.includes("unavailable") && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">
                  Unavailable
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {row.id}
                    </td>
                  )}
                  {selectedColumns.includes("site") && (
                    <td className="px-4 py-2 border border-gray-200">
                      <Link
                        href={`/resources/equipments/${row.site.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {row.site.name}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("total") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {row.total}
                    </td>
                  )}
                  {selectedColumns.includes("available") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {row.available}
                    </td>
                  )}
                  {selectedColumns.includes("unavailable") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {row.unavailable}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectedColumns.length}
                  className="px-4 py-2 text-center border border-gray-200"
                >
                  No equipment records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceEquipmentsPage;
