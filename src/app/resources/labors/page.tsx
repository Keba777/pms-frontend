"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { ChevronDown } from "lucide-react";
import { useLabors } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { GenericFilter, FilterField } from "@/components/common/GenericFilter";
import { Site } from "@/types/site";

interface AggregatedRow {
  id: number;
  site: Site;
  total: number;
  allocated: number;
  unallocated: number;
  onLeave: number;
  active: number;
  inactive: number;
  responsiblePerson: string;
}

const ResourceLaborsPage: React.FC = () => {
  // Data hooks
  const { data: labors, isLoading, error } = useLabors();
  const { data: sites, isLoading: siteLoading } = useSites();

  // Compute aggregated rows
  const allRows = useMemo<AggregatedRow[]>(() => {
    if (!labors || !sites) return [];
    const map: Record<string, Omit<AggregatedRow, 'id'>> = {};
    labors.forEach((lab) => {
      const site = sites.find((s) => s.id === lab.siteId);
      if (!site) return;
      if (!map[site.id]) {
        map[site.id] = {
          site,
          total: 0,
          allocated: 0,
          unallocated: 0,
          onLeave: 0,
          active: 0,
          inactive: 0,
          responsiblePerson: lab.responsiblePerson || 'Unknown',
        };
      }
      map[site.id].total += 1;
      switch (lab.allocationStatus) {
        case 'Allocated':
          map[site.id].allocated += 1;
          break;
        case 'Unallocated':
          map[site.id].unallocated += 1;
          break;
        case 'OnLeave':
          map[site.id].onLeave += 1;
          break;
      }
      if (lab.status === 'Active') map[site.id].active += 1;
      else if (lab.status === 'InActive') map[site.id].inactive += 1;
    });
    return Object.values(map).map((item, idx) => ({ id: idx + 1, ...item }));
  }, [labors, sites]);

  // Summary cards
  const summaryData = useMemo(
    () => [
      { label: 'Total Labor', value: allRows.reduce((sum, r) => sum + r.total, 0) },
      { label: 'Allocated', value: allRows.reduce((sum, r) => sum + r.allocated, 0) },
      { label: 'Unallocated', value: allRows.reduce((sum, r) => sum + r.unallocated, 0) },
      { label: 'On Leave', value: allRows.reduce((sum, r) => sum + r.onLeave, 0) },
      { label: 'Active', value: allRows.reduce((sum, r) => sum + r.active, 0) },
      { label: 'Inactive', value: allRows.reduce((sum, r) => sum + r.inactive, 0) },
    ],
    [allRows]
  );

  // UI state
  const [filters, setFilters] = useState<Record<string, string>>({ search: '', status: '' });
  const [filteredRows, setFilteredRows] = useState<AggregatedRow[]>(allRows);
  const [selectedColumns, setSelectedColumns] = useState<(keyof AggregatedRow)[]>([]);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Init selected columns
  useEffect(() => {
    const cols = Object.keys({
      id: 0,
      site: {},
      total: 0,
      allocated: 0,
      unallocated: 0,
      onLeave: 0,
      active: 0,
      inactive: 0,
      responsiblePerson: '',
    }) as (keyof AggregatedRow)[];
    setSelectedColumns(cols);
  }, []);

  // Apply filters
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

  // Close column menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Toggle column
  const toggleColumn = useCallback((col: keyof AggregatedRow) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }, []);

  const columnOptions: Record<keyof AggregatedRow, string> = {
    id: 'ID',
    site: 'Site Name',
    total: 'Total Labor',
    allocated: 'Allocated',
    unallocated: 'Unallocated',
    onLeave: 'On Leave',
    active: 'Active',
    inactive: 'Inactive',
    responsiblePerson: 'Responsible Person',
  };

  const filterFields: FilterField[] = [
    { name: 'search', label: 'Search', type: 'text', placeholder: 'Search by site...' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Select status...',
      options: [
        { label: 'Allocated', value: 'Allocated' },
        { label: 'Unallocated', value: 'Unallocated' },
        { label: 'On Leave', value: 'OnLeave' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'InActive' },
      ],
    },
  ];

  const downloadColumns: Column<AggregatedRow>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Site Name', accessor: (r) => r.site.name },
    { header: 'Total Labor', accessor: 'total' },
    { header: 'Allocated', accessor: 'allocated' },
    { header: 'Unallocated', accessor: 'unallocated' },
    { header: 'On Leave', accessor: 'onLeave' },
    { header: 'Active', accessor: 'active' },
    { header: 'Inactive', accessor: 'inactive' },
    { header: 'Responsible Person', accessor: 'responsiblePerson' },
  ];

  // Early returns after hooks
  if (isLoading || siteLoading) return <div>Loading labors...</div>;
  if (error) return <div>Error loading labors.</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <nav aria-label="breadcrumb" className="w-full sm:w-auto">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400 font-bold">/</li>
            <li className="text-gray-900 font-black uppercase tracking-wider">Labors</li>
          </ol>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {summaryData.map((item) => (
          <div
            key={item.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all"
          >
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{item.label}</p>
              <h2 className="text-2xl font-black text-gray-800">{item.value}</h2>
            </div>
            <div className="p-2 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
              <div className="w-4 h-4 bg-cyan-600 rounded-full opacity-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <GenericDownloads data={filteredRows} title="Labors" columns={downloadColumns} />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <div ref={menuRef} className="relative w-full lg:w-auto">
            <button
              onClick={() => setShowColumnMenu((v) => !v)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-sm font-bold text-sm"
            >
              Customize Columns <ChevronDown className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Visible Columns</span>
                </div>
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key as keyof AggregatedRow)}
                      onChange={() => toggleColumn(key as keyof AggregatedRow)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-bold">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="w-full lg:w-auto">
            <GenericFilter fields={filterFields} onFilterChange={(vals) => setFilters(vals as Record<string, string>)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {selectedColumns.includes("id") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200">ID</th>}
              {selectedColumns.includes("site") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider	border border-gray-200">Site Name</th>}
              {selectedColumns.includes("total") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider	border border-gray-200">Total Labor</th>}
              {selectedColumns.includes("allocated") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider	border border-gray-200">Allocated</th>}
              {selectedColumns.includes("unallocated") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking	wider	border border-gray-200">Unallocated</th>}
              {selectedColumns.includes("onLeave") && <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider	border border-gray-200">On Leave</th>}
              {selectedColumns.includes("active") && <th className="px-4 py-2 text-left text-xs	font-medium	text-gray-50 uppercase trackingwider	border border-gray-200">Active</th>}
              {selectedColumns.includes("inactive") && <th className="px-4 py-2 text-left text-xs fontmedium text-gray-50 uppercase trackingwider border border-gray-200">Inactive</th>}
              {selectedColumns.includes("responsiblePerson") && <th className="px-4 py-2 textleft text-xs font-medium text-gray-50 uppercase trackingwider border border-gray-200">Responsible Person</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {selectedColumns.includes("id") && <td className="px-4 py-2 border border-gray-200">{row.id}</td>}
                  {selectedColumns.includes("site") && <td className="px-4 py-2	border border-gray-200"><Link href={`/resources/labors/${row.site.id}`} className="textblue-600 hover:underline">{row.site.name}</Link></td>}
                  {selectedColumns.includes("total") && <td className="px-4 py-2	border border-gray-200">{row.total}</td>}
                  {selectedColumns.includes("allocated") && <td className="px-4 py-2	border border-gray-200">{row.allocated}</td>}
                  {selectedColumns.includes("unallocated") && <td className="px-4 py-2	border	border-gray-200">{row.unallocated}</td>}
                  {selectedColumns.includes("onLeave") && <td className="px-4 py-2	border	border-gray-200">{row.onLeave}</td>}
                  {selectedColumns.includes("active") && <td className="px-4 py-2	border bordergray-200">{row.active}</td>}
                  {selectedColumns.includes("inactive") && <td className="px-4 py-2	border	border-gray-200">{row.inactive}</td>}
                  {selectedColumns.includes("responsiblePerson") && <td className="px-4 py-2	border	border-gray-200">{row.responsiblePerson}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={selectedColumns.length} className="px-4 py-2 textcenter border border-gray-200">
                  No labor records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceLaborsPage;
