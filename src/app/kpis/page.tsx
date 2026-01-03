"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, PlusIcon, Trophy } from "lucide-react";
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
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-card p-8 sm:p-12 rounded-[3.5rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-8 relative z-10 w-full sm:w-auto">
            <div className="rounded-[2.5rem] bg-primary/10 p-6 shadow-xl border border-primary/20">
              <Trophy className="text-primary" size={32} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tighter">
                KPI Performance Center
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                <span className="w-12 h-px bg-primary/30" /> Key Performance Indicators Monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto justify-end">
            <GenericDownload data={filteredKpis} columns={downloadColumns} title="KPI_Intelligence_Report" />
          </div>
        </header>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {["users", "labors", "equipment"].map((type) => (
            <button
              key={type}
              onClick={() => setTableType(type as any)}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${tableType === type
                ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
            >
              {type} Sector
            </button>
          ))}
        </div>

        <div className="bg-card p-8 rounded-[2.5rem] shadow-2xl shadow-black/5 border border-border flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div ref={menuRef} className="relative w-full lg:w-auto">
                <button
                  onClick={() => setShowColumnMenu((prev) => !prev)}
                  className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                >
                  Configure Perspective <ChevronDown className="w-4 h-4" />
                </button>
                {showColumnMenu && (
                  <div className="absolute left-0 mt-4 w-64 bg-card border border-border rounded-3xl shadow-2xl z-50 py-4 max-h-[60vh] overflow-y-auto backdrop-blur-3xl">
                    <div className="px-6 py-3 border-b border-border mb-3">
                      <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Visibility Controls</p>
                    </div>
                    {Object.entries(columnOptions).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center px-6 py-3 hover:bg-primary/5 cursor-pointer transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(key)}
                          onChange={() => toggleColumn(key)}
                          className="w-5 h-5 rounded-lg border-border text-primary focus:ring-primary/20 mr-4 transition-all"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
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
        <div className="overflow-hidden bg-card rounded-[2.5rem] border border-border shadow-2xl shadow-black/5">
          {isLoading ? (
            <KpiTableSkeleton tableType={tableType} selectedColumns={selectedColumns} />
          ) : (
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary/5">
                <tr>
                  {selectedColumns.includes("type") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Performance Type
                    </th>
                  )}
                  {selectedColumns.includes("score") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Score Rating
                    </th>
                  )}
                  {selectedColumns.includes("remark") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Observation
                    </th>
                  )}
                  {selectedColumns.includes("userLabor") && tableType === "users" && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Identity
                    </th>
                  )}
                  {selectedColumns.includes("laborInformation") &&
                    tableType === "labors" && (
                      <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                        Labor Resource
                      </th>
                    )}
                  {selectedColumns.includes("equipment") &&
                    tableType === "equipment" && (
                      <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                        Equipment Unit
                      </th>
                    )}
                  {selectedColumns.includes("target") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Operational Goal
                    </th>
                  )}
                  {selectedColumns.includes("status") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Efficiency state
                    </th>
                  )}
                  {selectedColumns.includes("createdAt") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Sync Timestamp
                    </th>
                  )}
                  {selectedColumns.includes("actions") && (
                    <th className="px-8 py-6 text-left text-[10px] font-black text-primary uppercase tracking-widest">
                      Protocol
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border/50">
                {filteredKpis.length > 0 ? (
                  filteredKpis.map((kpi) => (
                    <tr key={kpi.id} className="hover:bg-primary/5 transition-all group">
                      {selectedColumns.includes("type") && (
                        <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                          <Link href={`/kpis/${kpi.id}`} className="hover:underline flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                            {kpi.type}
                          </Link>
                        </td>
                      )}
                      {selectedColumns.includes("score") && (
                        <td className="px-8 py-6 text-[10px] font-black text-foreground group-hover:text-primary transition-colors">
                          {kpi.score}
                        </td>
                      )}
                      {selectedColumns.includes("remark") && (
                        <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground/60 max-w-xs truncate italic">
                          {kpi.remark ?? "N/A"}
                        </td>
                      )}
                      {selectedColumns.includes("userLabor") && tableType === "users" && (
                        <td className="px-8 py-6">
                          {kpi.userLabor ? <ProfileAvatar user={kpi.userLabor} /> : "N/A"}
                        </td>
                      )}
                      {selectedColumns.includes("laborInformation") && tableType === "labors" && (
                        <td className="px-8 py-6">
                          {kpi.laborInformation ? (
                            <Link href={`/labors/${kpi.laborInformation.id}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                              {kpi.laborInformation.firstName} {kpi.laborInformation.lastName}
                            </Link>
                          ) : "N/A"}
                        </td>
                      )}
                      {selectedColumns.includes("equipment") && tableType === "equipment" && (
                        <td className="px-8 py-6">
                          {kpi.equipment ? (
                            <Link href={`/equipment/${kpi.equipment.id}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                              {kpi.equipment.item}
                            </Link>
                          ) : "N/A"}
                        </td>
                      )}
                      {selectedColumns.includes("target") && (
                        <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">
                          {kpi.target ?? "N/A"}
                        </td>
                      )}
                      {selectedColumns.includes("status") && (
                        <td className="px-8 py-6">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm ${kpi.status === "Excellent"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : kpi.status === "V.Good"
                                ? "bg-primary/5 text-primary/80 border-primary/10"
                                : kpi.status === "Good"
                                  ? "bg-muted text-muted-foreground border-border"
                                  : "bg-destructive/10 text-destructive border-destructive/20"
                              }`}
                          >
                            {kpi.status}
                          </span>
                        </td>
                      )}
                      {selectedColumns.includes("createdAt") && (
                        <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground/40 whitespace-nowrap uppercase tracking-widest">
                          {new Date(kpi.createdAt).toLocaleString()}
                        </td>
                      )}
                      {selectedColumns.includes("actions") && (
                        <td className="px-8 py-6 whitespace-nowrap">
                          <Menu as="div" className="relative inline-block text-left">
                            <MenuButton className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                              Protocol <ChevronDown className="w-3 h-3" />
                            </MenuButton>
                            <MenuItems className="absolute right-0 mt-4 w-52 bg-card border border-border divide-y divide-border/50 rounded-2xl shadow-2xl focus:outline-none z-[9999] py-2 backdrop-blur-3xl">
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    className={`block w-full px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                                      }`}
                                    onClick={() => handleViewKpi(kpi.id)}
                                  >
                                    Access Matrix
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
                    <td colSpan={selectedColumns.length} className="px-8 py-24 text-center bg-muted/5">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center animate-pulse">
                          <Trophy className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">No operational telemetry detected</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpisPage;
