"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useDeleteKpi, useCreateKpi, useUpdateKpi } from "@/hooks/useKpis";
import { CreateKpiInput, UpdateKpiInput, Kpi } from "@/types/kpi";
import KpiForm from "../forms/KpiForm";
import EditKpiForm from "../forms/EditKpiForm";

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

interface KpiProps {
  kpis?: Kpi[];
}

const KpiTable = ({ kpis }: KpiProps) => {
  const { mutate: deleteKpi } = useDeleteKpi();
  const { mutate: createKpi } = useCreateKpi();
  const { mutate: updateKpi } = useUpdateKpi();
  const router = useRouter();

  const [tableType, setTableType] = useState<"users" | "labors" | "equipment">(
    "users"
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);

  const filteredKpis =
    kpis?.filter((k) => {
      if (tableType === "users") return !!k.userLaborId;
      if (tableType === "labors") return !!k.laborInfoId;
      if (tableType === "equipment") return !!k.equipmentId;
      return false;
    }) || [];

  // Close column menu when clicking outside
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

  // Handlers
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

  const handleEditKpiClick = (kpi: Kpi) => {
    setSelectedKpi(kpi);
    setShowEditForm(true);
  };

  const handleKpiSubmit = (data: CreateKpiInput) => {
    createKpi(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleEditKpiSubmit = (data: UpdateKpiInput) => {
    if (selectedKpi) {
      updateKpi({ id: selectedKpi.id, ...data }, {
        onSuccess: () => setShowEditForm(false),
      });
    }
  };

  return (
    <div>
      <div className="mt-8 flex justify-between gap-2 ">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 md:px-4 px-2 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 md:right-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full md:px-4 px-2 py-2 hover:bg-accent cursor-pointer"
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
        <button
          className=" bg-primary hover:bg-primary/90 text-primary-foreground font-bold md:py-2 py-1 md:px-3 px-2 rounded text-sm"
          onClick={() => setShowForm(true)}
        >
          <PlusIcon width={15} height={12} />
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-y-auto max-h-[80vh]">
            <KpiForm
              tableType={tableType}
              onSubmit={handleKpiSubmit}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
      {showEditForm && selectedKpi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-y-auto max-h-[80vh]">
            <EditKpiForm
              kpi={selectedKpi}
              onSubmit={handleEditKpiSubmit}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="mb-6 mt-4">
        <ul className="flex flex-wrap space-x-4">
          <li>
            <button
              onClick={() => setTableType("users")}
              className={`md:px-4 px-2 md:py-2 py-1 rounded ${tableType === "users"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
            >
              Users
            </button>
          </li>
          <li>
            <button
              onClick={() => setTableType("labors")}
              className={`md:px-4 px-2 md:py-2 py-1 rounded ${tableType === "labors"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
            >
              Labors
            </button>
          </li>
          <li>
            <button
              onClick={() => setTableType("equipment")}
              className={`md:px-4 px-2 md:py-2 py-1 rounded ${tableType === "equipment"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
            >
              Equipment
            </button>
          </li>
        </ul>
      </nav>

      {/* Delete Modal */}
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
        <table className="w-full divide-y divide-border">
          <thead className="bg-primary">
            <tr>
              {selectedColumns.includes("type") && (
                <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                  Type
                </th>
              )}
              {selectedColumns.includes("score") && (
                <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                  Score
                </th>
              )}

              {selectedColumns.includes("remark") && (
                <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                  Remark
                </th>
              )}
              {selectedColumns.includes("userLabor") &&
                tableType === "users" && (
                  <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                    User
                  </th>
                )}
              {selectedColumns.includes("laborInformation") &&
                tableType === "labors" && (
                  <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                    Labor Info
                  </th>
                )}
              {selectedColumns.includes("equipment") &&
                tableType === "equipment" && (
                  <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                    Equipment
                  </th>
                )}
              {selectedColumns.includes("target") && (
                <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                  Target
                </th>
              )}

              {selectedColumns.includes("status") && (
                <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                  Status
                </th>
              )}

              {selectedColumns.includes("actions") && (
                <th className="md:px-4 px-2 md:py-3 py-2 text-left text-sm font-medium text-primary-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {filteredKpis.length > 0 ? (
              filteredKpis.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-accent">
                  {selectedColumns.includes("type") && (
                    <td className="md:px-4 px-2 md:py-2 py-1 font-medium text-primary">
                      <Link
                        href={`/kpi/${kpi.id}`}
                        className="hover:underline"
                      >
                        {kpi.type}
                      </Link>
                    </td>
                  )}
                  {selectedColumns.includes("score") && (
                    <td className="md:px-4 px-2 md:py-2 py-1">{kpi.score}</td>
                  )}

                  {selectedColumns.includes("remark") && (
                    <td className="md:px-4 px-2 md:py-2 py-1">{kpi.remark || "N/A"}</td>
                  )}
                  {selectedColumns.includes("userLabor") &&
                    tableType === "users" && (
                      <td className="md:px-4 px-2 md:py-2 py-1">
                        {kpi.userLabor ? (
                          <ProfileAvatar user={kpi.userLabor} />
                        ) : (
                          "N/A"
                        )}
                      </td>
                    )}
                  {selectedColumns.includes("laborInformation") &&
                    tableType === "labors" && (
                      <td className="md:px-4 px-2 md:py-2 py-1">
                        {kpi.laborInformation ? (
                          <Link
                            href={`/labors/${kpi.laborInformation.id}`}
                            className="hover:underline"
                          >
                            {kpi.laborInformation.firstName}{" "}
                            {kpi.laborInformation.lastName}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    )}
                  {selectedColumns.includes("equipment") &&
                    tableType === "equipment" && (
                      <td className="md:px-4 px-2 md:py-2 py-1">
                        {kpi.equipment ? (
                          <Link
                            href={`/equipment/${kpi.equipment.id}`}
                            className="hover:underline"
                          >
                            {kpi.equipment.item}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    )}
                  {selectedColumns.includes("target") && (
                    <td className="md:px-4 px-2 md:py-2 py-1">{kpi.target ?? "N/A"}</td>
                  )}

                  {selectedColumns.includes("status") && (
                    <td className="md:px-4 px-2 md:py-2 py-1">
                      <span
                        className={`badge bg-muted md:px-2 px-1 md:py-1 py-0.5 rounded ${kpi.status === "Excellent"
                            ? "text-primary"
                            : kpi.status === "V.Good"
                              ? "text-blue-500"
                              : kpi.status === "Good"
                                ? "text-yellow-500"
                                : "text-destructive"
                          }`}
                      >
                        {kpi.status}
                      </span>
                    </td>
                  )}

                  {selectedColumns.includes("actions") && (
                    <td className="md:px-4 px-2 md:py-2 py-1">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 md:px-3 px-2 md:py-1 py-0.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full md:px-4 px-2 py-2 text-left ${active ? "bg-accent" : ""
                                  }`}
                                onClick={() => handleViewKpi(kpi.id)}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full md:px-4 px-2 py-2 text-left ${active ? "bg-accent" : ""
                                  }`}
                                onClick={() => handleEditKpiClick(kpi)}
                              >
                                Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`block w-full md:px-4 px-2 py-2 text-left ${active ? "bg-accent" : ""
                                  }`}
                                onClick={() => handleDeleteKpiClick(kpi.id)}
                              >
                                Delete
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
                <td
                  colSpan={selectedColumns.length}
                  className="md:px-4 px-2 md:py-2 py-1 text-center text-muted-foreground"
                >
                  No KPIs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KpiTable;
