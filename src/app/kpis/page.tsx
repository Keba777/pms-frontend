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
    <div>
      {/* Toolbar */}
      <div className=" mt-8">
        <GenericDownload data={filteredKpis} columns={downloadColumns} title="KPI_List" />
        <div className="flex items-center justify-between my-5">
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Customize Columns <ChevronDown className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key)}
                      onChange={() => toggleColumn(key)}
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
            onFilterChange={setFilterValues}
          />
        </div>
      </div>
      {/* Navigation */}
      <nav className="mb-6 mt-4">
        <ul className="flex space-x-4">
          {["users", "labors", "equipment"].map((type) => (
            <li key={type}>
              <button
                onClick={() => setTableType(type as any)}
                className={`px-4 py-2 rounded ${
                  tableType === type
                    ? "bg-cyan-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

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
      <div className="overflow-x-auto">
        {isLoading ? (
          <KpiTableSkeleton tableType={tableType} selectedColumns={selectedColumns} />
        ) : (
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                {selectedColumns.includes("type") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Type
                  </th>
                )}
                {selectedColumns.includes("score") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Score
                  </th>
                )}
                {selectedColumns.includes("remark") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Remark
                  </th>
                )}
                {selectedColumns.includes("userLabor") && tableType === "users" && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    User
                  </th>
                )}
                {selectedColumns.includes("laborInformation") &&
                  tableType === "labors" && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                      Labor Info
                    </th>
                  )}
                {selectedColumns.includes("equipment") &&
                  tableType === "equipment" && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                      Equipment
                    </th>
                  )}
                {selectedColumns.includes("target") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Target
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Status
                  </th>
                )}
                {selectedColumns.includes("createdAt") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Created At
                  </th>
                )}
                {selectedColumns.includes("actions") && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKpis.length > 0 ? (
                filteredKpis.map((kpi) => (
                  <tr key={kpi.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("type") && (
                      <td className="px-4 py-2 font-medium text-bs-primary">
                        <Link href={`/kpis/${kpi.id}`} className="hover:underline">
                          {kpi.type}
                        </Link>
                      </td>
                    )}
                    {selectedColumns.includes("score") && <td className="px-4 py-2">{kpi.score}</td>}
                    {selectedColumns.includes("remark") && <td className="px-4 py-2">{kpi.remark ?? "N/A"}</td>}
                    {selectedColumns.includes("userLabor") && tableType === "users" && (
                      <td className="px-4 py-2">
                        {kpi.userLabor ? <ProfileAvatar user={kpi.userLabor} /> : "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("laborInformation") && tableType === "labors" && (
                      <td className="px-4 py-2">
                        {kpi.laborInformation ? (
                          <Link href={`/labors/${kpi.laborInformation.id}`} className="hover:underline">
                            {kpi.laborInformation.firstName} {kpi.laborInformation.lastName}
                          </Link>
                        ) : "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("equipment") && tableType === "equipment" && (
                      <td className="px-4 py-2">
                        {kpi.equipment ? (
                          <Link href={`/equipment/${kpi.equipment.id}`} className="hover:underline">
                            {kpi.equipment.item}
                          </Link>
                        ) : "N/A"}
                      </td>
                    )}
                    {selectedColumns.includes("target") && <td className="px-4 py-2">{kpi.target ?? "N/A"}</td>}
                    {selectedColumns.includes("status") && (
                      <td className="px-4 py-2">
                        <span
                          className={`badge bg-gray-100 px-2 py-1 rounded ${
                            kpi.status === "Excellent"
                              ? "text-green-600"
                              : kpi.status === "V.Good"
                              ? "text-blue-500"
                              : kpi.status === "Good"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {kpi.status}
                        </span>
                      </td>
                    )}
                    {selectedColumns.includes("createdAt") && (
                      <td className="px-4 py-2">
                        {new Date(kpi.createdAt).toLocaleString()}
                      </td>
                    )}
                    {selectedColumns.includes("actions") && (
                      <td className="px-4 py-2">
                        <Menu>
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                            Action <ChevronDown className="w-4 h-4" />
                          </MenuButton>
                          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left ${
                                    active ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => handleViewKpi(kpi.id)}
                                >
                                  View
                                </button>
                              )}
                            </MenuItem>
                            {/* <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left ${
                                    active ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => handleEditClick(kpi)}
                                >
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`block w-full px-4 py-2 text-left ${
                                    active ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => handleDeleteKpiClick(kpi.id)}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem> */}
                          </MenuItems>
                        </Menu>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={selectedColumns.length} className="px-4 py-2 text-center text-gray-500">
                    No KPIs found.
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
