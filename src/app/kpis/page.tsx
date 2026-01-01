"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import GenericDownload, { Column } from "@/components/common/GenericDownloads";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useKpis, useDeleteKpi, useUpdateKpi, useCreateKpi } from "@/hooks/useKpis";
import EditKpiForm from "@/components/forms/EditKpiForm";
import KpiTableSkeleton from "@/components/skeletons/KpiTableSkeleton";


const columnOptions: Record<string, string> = {
  type: "Type",
  score: "Score",
  status: "Status",
  remark: "Remark",
  userLabor: "User",
  laborInformation: "Labor Info",
  equipment: "Equipment",
  target: "Target",
  createdAt: "Created At",
  actions: "Actions",
};

const KpisPage: React.FC = () => {
  const { data: kpis = [], isLoading, error } = useKpis();
  const { mutate: deleteKpi } = useDeleteKpi();
  const { mutate: updateKpi, isPending: isUpdating } = useUpdateKpi();
  const { mutate: createKpi, isPending: isCreating } = useCreateKpi();
  const router = useRouter();
  const [tableType, setTableType] = useState<"users" | "labors" | "equipment">(
    "users"
  );
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [kpiToEdit, setKpiToEdit] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (error) return <div>Error fetching KPIs.</div>;

  // Filter options
  const statusOptions: Option<string>[] = [
    { label: "Bad", value: "Bad" },
    { label: "Good", value: "Good" },
    { label: "V.Good", value: "V.Good" },
    { label: "Excellent", value: "Excellent" },
  ];
  const filterFields: FilterField<string>[] = [
    { name: "status", label: "Status", type: "select", options: statusOptions },
    {
      name: "scoreMin",
      label: "Min Score",
      type: "number",
      placeholder: "Min score...",
    },
    {
      name: "scoreMax",
      label: "Max Score",
      type: "number",
      placeholder: "Max score...",
    },
  ];

  const filteredKpis = kpis.filter((kpi) => {
    let matches = true;
    if (tableType === "users" && !kpi.userLabor) matches = false;
    if (tableType === "labors" && !kpi.laborInformation) matches = false;
    if (tableType === "equipment" && !kpi.equipment) matches = false;
    if (filterValues.status) matches = matches && kpi.status === filterValues.status;
    if (filterValues.scoreMin) matches = matches && kpi.score >= Number(filterValues.scoreMin);
    if (filterValues.scoreMax) matches = matches && kpi.score <= Number(filterValues.scoreMax);
    return matches;
  });

  // --- DOWNLOAD COLUMNS ---
  const downloadColumns: Column<any>[] = [
    { header: "ID", accessor: (kpi, index) => `KPI${String(index! + 1).padStart(3, "0")}` },
    { header: "Type", accessor: (kpi) => kpi.type },
    { header: "Score", accessor: (kpi) => kpi.score },
    { header: "Remark", accessor: (kpi) => kpi.remark ?? "N/A" },
    {
      header: "User",
      accessor: (kpi) =>
        kpi.userLabor ? `${kpi.userLabor.first_name} ${kpi.userLabor.last_name}` : "N/A",
    },
    {
      header: "Labor Info",
      accessor: (kpi) =>
        kpi.laborInformation
          ? `${kpi.laborInformation.firstName} ${kpi.laborInformation.lastName}`
          : "N/A",
    },
    { header: "Equipment", accessor: (kpi) => kpi.equipment?.item ?? "N/A" },
    { header: "Target", accessor: (kpi) => kpi.target ?? "N/A" },
    { header: "Status", accessor: (kpi) => kpi.status },
  ];

  const handleDeleteKpiClick = (id: string) => {
    setSelectedKpiId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteKpi = () => {
    if (selectedKpiId) {
      deleteKpi(selectedKpiId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewKpi = (id: string) => router.push(`/kpis/${id}`);

  const handleEditClick = (kpi: any) => {
    setKpiToEdit(kpi);
    setShowEditForm(true);
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
          Key Performance Indicators
        </h1>
        <div className="flex items-center gap-2">
          <GenericDownload data={filteredKpis} columns={downloadColumns} title="KPI_List" />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-2">
          {["users", "labors", "equipment"].map((type) => (
            <button
              key={type}
              onClick={() => setTableType(type as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tableType === type
                ? "bg-cyan-700 text-white shadow-md shadow-cyan-200"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div ref={menuRef} className="relative w-full lg:w-auto">
              <button
                onClick={() => setShowColumnMenu((prev) => !prev)}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
              >
                Customize Columns <ChevronDown className="w-4 h-4" />
              </button>
              {showColumnMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 max-h-[60vh] overflow-y-auto backdrop-blur-sm bg-white/95">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Columns</p>
                  </div>
                  {Object.entries(columnOptions).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(key)}
                        onChange={() => toggleColumn(key)}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 mr-3"
                      />
                      <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {showEditForm && kpiToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditKpiForm
              kpi={kpiToEdit}
              onSubmit={(data) => updateKpi(data, { onSuccess: () => setShowEditForm(false) })}
              onClose={() => setShowEditForm(false)}
              isPending={isUpdating}
            />
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this KPI?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteKpi}
        />
      )}
      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        {isLoading ? (
          <KpiTableSkeleton tableType={tableType} selectedColumns={selectedColumns} />
        ) : (
          <table className="min-w-max divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {selectedColumns.includes("type") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Type
                  </th>
                )}
                {selectedColumns.includes("score") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Score
                  </th>
                )}
                {selectedColumns.includes("remark") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Remark
                  </th>
                )}
                {selectedColumns.includes("userLabor") && tableType === "users" && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    User
                  </th>
                )}
                {selectedColumns.includes("laborInformation") &&
                  tableType === "labors" && (
                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Labor Info
                    </th>
                  )}
                {selectedColumns.includes("equipment") &&
                  tableType === "equipment" && (
                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Equipment
                    </th>
                  )}
                {selectedColumns.includes("target") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Target
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                )}
                {selectedColumns.includes("createdAt") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Created At
                  </th>
                )}
                {selectedColumns.includes("actions") && (
                  <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKpis.length > 0 ? (
                filteredKpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50/50 transition-colors">
                    {selectedColumns.includes("type") && (
                      <td className="px-5 py-4 text-sm font-bold text-cyan-700">
                        <Link href={`/kpis/${kpi.id}`} className="hover:underline">
                          {kpi.type}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("score") && (
                      <td className="px-5 py-4 text-sm font-black text-gray-700 group-hover:text-cyan-700 transition-colors">
                        {kpi.score}
                      </td>
                    )}
                    {selectedColumns.includes("remark") && (
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate italic">
                        {kpi.remark ?? "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("userLabor") && tableType === "users" && (
                      <td className="px-5 py-4">
                        {kpi.userLabor ? <ProfileAvatar user={kpi.userLabor} /> : "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("laborInformation") && tableType === "labors" && (
                      <td className="px-5 py-4">
                        {kpi.laborInformation ? (
                          <Link href={`/labors/${kpi.laborInformation.id}`} className="text-sm font-bold text-gray-700 hover:text-cyan-700 hover:underline">
                            {kpi.laborInformation.firstName} {kpi.laborInformation.lastName}
                          </Link>
                        ) : "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("equipment") && tableType === "equipment" && (
                      <td className="px-5 py-4">
                        {kpi.equipment ? (
                          <Link href={`/equipment/${kpi.equipment.id}`} className="text-sm font-bold text-gray-700 hover:text-cyan-700 hover:underline">
                            {kpi.equipment.item}
                          </Link>
                        ) : "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("target") && (
                      <td className="px-5 py-4 text-sm font-bold text-emerald-600">
                        {kpi.target ?? "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("status") && (
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${kpi.status === "Excellent"
                            ? "bg-emerald-100 text-emerald-800"
                            : kpi.status === "V.Good"
                              ? "bg-blue-100 text-blue-800"
                              : kpi.status === "Good"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                        >
                          {kpi.status}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("createdAt") && (
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(kpi.createdAt).toLocaleString()}
                      </td>
                    )}
                    {selectedColumns.includes("actions") && (
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-all shadow-sm">
                            Action <ChevronDown className="w-3 h-3" />
                          </MenuButton>
                          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-[9999] py-1 backdrop-blur-sm bg-white/95">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left text-xs font-bold text-gray-700 ${active ? "bg-gray-50 text-cyan-700" : ""
                                    }`}
                                  onClick={() => handleViewKpi(kpi.id)}
                                >
                                  View Details
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Menu>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedColumns.length} className="px-5 py-8 text-center bg-gray-50/30">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">No KPIs found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KpisPage;
