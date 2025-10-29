"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useActivities,
  useDeleteActivity,
  useUpdateActivity,
  useUpdateActivityActuals,
} from "@/hooks/useActivities";
import { UpdateActivityInput, Activity, Actuals } from "@/types/activity";
import EditActivityForm from "../forms/EditActivityForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import ActivityTableSkeleton from "./ActivityTableSkeleton";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react"; 
import "ag-grid-community/styles/ag-theme-alpine.css"; 

interface ResourceCosts {
  labor: { ot: number; dt: number };
  material: { ot: number; dt: number };
  equipment: { ot: number; dt: number };
  total: number;
}

interface ExtendedActivity extends Activity {
  resourceCosts: ResourceCosts;
  overUnder: string;
}

const ActualActivityTable: React.FC = () => {
  const {
    data: activities,
    isLoading: loadingAct,
    error: errorAct,
  } = useActivities();
  const { mutate: deleteActivity } = useDeleteActivity();
  const { mutate: updateActivity } = useUpdateActivity();
  const { mutate: updateActivityActuals } = useUpdateActivityActuals(); 
  const router = useRouter();
  const gridRef = useRef<AgGridReact>(null);

  // Column-customization state (kept for custom menu; AG Grid has built-in too)
  const columnOptions: Record<string, string> = {
    id: "ID",
    activity_name: "Activities",
    unit: "Unit",
    quantity: "Qty",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    progress: "Progress",
    status: "Status",
    labor: "Labor",
    material: "Material",
    equipment: "Equipment",
    total: "Total",
    overUnder: "Over/Under",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit/delete modals state
  const [showEditForm, setShowEditForm] = useState(false);
  const [activityToEdit, setActivityToEdit] =
    useState<UpdateActivityInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  // Handle outside-click for column menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultActuals: Actuals = {
    quantity: null,
    unit: null,
    start_date: null,
    end_date: null,
    progress: null,
    status: null,
    labor_cost: null,
    material_cost: null,
    equipment_cost: null,
    total_cost: null,
    work_force: null,
    machinery_list: null,
    materials_list: null,
  };

  // Derived extendedActivities with actuals handling
  const extendedActivities: ExtendedActivity[] = useMemo(() => {
    if (!activities) return [];
    return activities.map((act) => {
      const actuals = { ...defaultActuals, ...(act.actuals || {}) }; // Ensure full Actuals with defaults
      const laborCost = actuals.labor_cost ?? 0;
      const materialCost = actuals.material_cost ?? 0;
      const equipmentCost = actuals.equipment_cost ?? 0;
      const total = laborCost + materialCost + equipmentCost;
      const laborDiff = (actuals.labor_cost ?? 0) - (act.labor_cost ?? 0);
      const materialDiff =
        (actuals.material_cost ?? 0) - (act.material_cost ?? 0);
      const equipmentDiff =
        (actuals.equipment_cost ?? 0) - (act.equipment_cost ?? 0);
      const totalDiff = laborDiff + materialDiff + equipmentDiff;
      return {
        ...act,
        actuals, // Full Actuals object
        resourceCosts: {
          labor: { ot: laborCost, dt: laborDiff },
          material: { ot: materialCost, dt: materialDiff },
          equipment: { ot: equipmentCost, dt: equipmentDiff },
          total,
        },
        overUnder: `$${totalDiff.toFixed(2)}`, // Formatted difference
      };
    });
  }, [activities]);

  // Column toggle (updates visibility in AG Grid)
  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // Edit/delete handlers
  const handleDeleteClick = (id: string) => {
    setSelectedActivityId(id);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (selectedActivityId) deleteActivity(selectedActivityId);
    setIsDeleteModalOpen(false);
  };
  const handleEditClick = (item: ExtendedActivity) => {
    setActivityToEdit({
      ...item,
      assignedUsers: item.assignedUsers?.map((u) => u.id) || [],
    });
    setShowEditForm(true);
  };
  const handleEditSubmit = (data: UpdateActivityInput) => {
    updateActivity(data);
    setShowEditForm(false);
  };

  // Custom cell renderer for progress bar
  const ProgressRenderer = (params: any) => {
    return (
      <div className="relative h-full bg-gray-200 rounded">
        <div
          className="absolute h-full bg-blue-600 rounded"
          style={{ width: `${params.value}%` }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {params.value}%
          </span>
        </div>
      </div>
    );
  };

  // Custom cell renderer for actions menu
  const ActionsRenderer = (params: any) => {
    return (
      <Menu as="div" className="relative inline-block text-left">
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
                onClick={() => router.push(`/activities/${params.data.id}`)}
              >
                Quick View
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-4 py-2 text-left ${
                  active ? "bg-blue-100" : ""
                }`}
                onClick={() => handleEditClick(params.data)}
              >
                Update
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-4 py-2 text-left ${
                  active ? "bg-blue-100" : ""
                }`}
                onClick={() => handleDeleteClick(params.data.id)}
              >
                Delete
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    );
  };

  // Custom cell renderer for activity name link
  const NameRenderer = (params: any) => {
    return (
      <Link href={`/activities/${params.data.id}`} className="hover:underline">
        {params.value}
      </Link>
    );
  };

  // Helper: sanitize actuals before sending to API
  const sanitizeActualsForApi = (raw: any): Actuals => {
    // Accept raw fields possibly Date objects, strings, numbers or nulls.
    const safe = { ...(raw || {}) } as any;

    // Dates -> ISO or null
    const toIso = (v: any) => {
      if (!v && v !== 0) return null;
      try {
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return d.toISOString();
      } catch {
        return null;
      }
    };
    safe.start_date = toIso(safe.start_date);
    safe.end_date = toIso(safe.end_date);

    // Numeric fields -> numbers or null
    const toNumberOrNull = (v: any) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    safe.labor_cost = toNumberOrNull(safe.labor_cost);
    safe.material_cost = toNumberOrNull(safe.material_cost);
    safe.equipment_cost = toNumberOrNull(safe.equipment_cost);
    safe.total_cost = toNumberOrNull(safe.total_cost);
    safe.quantity = toNumberOrNull(safe.quantity);
    safe.progress = toNumberOrNull(safe.progress);

    // strings or nulls
    safe.unit = safe.unit ?? null;
    safe.status = safe.status ?? null;
    safe.work_force = safe.work_force ?? null;
    safe.machinery_list = safe.machinery_list ?? null;
    safe.materials_list = safe.materials_list ?? null;

    return safe as Actuals;
  };

  // Handle cell edit: Update actuals and save via API (sanitized)
  const handleCellValueChanged = (params: any) => {
    const { data, colDef, newValue } = params;
    const fieldParts = (colDef.field || "").split("."); // e.g., ['actuals','labor_cost']
    if (fieldParts[0] === "actuals") {
      // Ensure data.actuals exists
      data.actuals = { ...(data.actuals || {}), ...(data.actuals || {}) };

      // If valueSetters already changed the data, just sanitize and send
      const sanitized = sanitizeActualsForApi(data.actuals);

      // update local data to sanitized (so UI uses consistent shapes)
      data.actuals = sanitized;

      // Call mutate, log errors for debugging
      updateActivityActuals(
        { id: data.id, actuals: sanitized },
        {
          onError: (err: any) => {
            console.error("Failed to update actuals:", err);
            // let hooks show toast as well; we console log the raw error
          },
        }
      );
    }

    // Refresh row to update calculated fields (e.g., diffs)
    params.api.refreshCells({ rowNodes: [params.node], force: true });
  };

  // Dynamic columnDefs based on selectedColumns
  const columnDefs = useMemo(() => {
    const allDefs: any[] = [
      {
        headerName: "ID",
        valueGetter: (params: any) =>
          `RC${String(params.node.rowIndex + 1).padStart(3, "0")}`,
        hide: !selectedColumns.includes("id"),
      },
      {
        headerName: "Activities",
        field: "activity_name",
        cellRenderer: NameRenderer,
        hide: !selectedColumns.includes("activity_name"),
      },
      {
        headerName: "Unit",
        field: "actuals.unit",
        valueGetter: (params: any) => params.data.actuals?.unit ?? "",
        valueSetter: (params: any) => {
          params.data.actuals.unit = params.newValue || null;
          return true;
        },
        editable: true,
        hide: !selectedColumns.includes("unit"),
      },
      {
        headerName: "Qty",
        field: "actuals.quantity",
        valueGetter: (params: any) => params.data.actuals?.quantity ?? "",
        valueSetter: (params: any) => {
          const v = params.newValue;
          params.data.actuals.quantity = v === "" ? null : parseFloat(v);
          return true;
        },
        editable: true,
        hide: !selectedColumns.includes("quantity"),
      },
      {
        headerName: "Start Date",
        field: "actuals.start_date",
        valueGetter: (params: any) => {
          const date = params.data.actuals?.start_date;
          if (!date) return "";
          // date might be ISO already
          const d = new Date(date);
          return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
        },
        valueSetter: (params: any) => {
          // store raw value (will be sanitized when sending)
          params.data.actuals.start_date = params.newValue || null;
          return true;
        },
        editable: true,
        cellEditor: "agDateCellEditor",
        hide: !selectedColumns.includes("start_date"),
      },
      {
        headerName: "End Date",
        field: "actuals.end_date",
        valueGetter: (params: any) => {
          const date = params.data.actuals?.end_date;
          if (!date) return "";
          const d = new Date(date);
          return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
        },
        valueSetter: (params: any) => {
          params.data.actuals.end_date = params.newValue || null;
          return true;
        },
        editable: true,
        cellEditor: "agDateCellEditor",
        hide: !selectedColumns.includes("end_date"),
      },
      {
        headerName: "Duration",
        valueGetter: (params: any) => {
          const start = params.data.actuals?.start_date;
          const end = params.data.actuals?.end_date;
          if (!start || !end) return "";
          const diff = Math.ceil(
            (new Date(end).getTime() - new Date(start).getTime()) /
              (1000 * 3600 * 24)
          );
          return isNaN(diff) ? "" : diff;
        },
        hide: !selectedColumns.includes("duration"),
      },
      {
        headerName: "Progress",
        field: "actuals.progress",
        valueGetter: (params: any) => params.data.actuals?.progress ?? 0,
        valueSetter: (params: any) => {
          const v = params.newValue;
          params.data.actuals.progress = v === "" ? null : parseInt(v);
          return true;
        },
        editable: true,
        cellRenderer: ProgressRenderer,
        hide: !selectedColumns.includes("progress"),
      },
      {
        headerName: "Status",
        field: "actuals.status",
        valueGetter: (params: any) => params.data.actuals?.status ?? "",
        valueSetter: (params: any) => {
          params.data.actuals.status = params.newValue || null;
          return true;
        },
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [
            "Not Started",
            "Started",
            "InProgress",
            "Canceled",
            "Onhold",
            "Completed",
            null,
          ],
        },
        hide: !selectedColumns.includes("status"),
      },
      {
        headerName: "Labor",
        hide: !selectedColumns.includes("labor"),
        children: [
          {
            headerName: "cost",
            field: "actuals.labor_cost",
            valueGetter: (params: any) => params.data.actuals?.labor_cost ?? "",
            valueSetter: (params: any) => {
              const v = params.newValue;
              params.data.actuals.labor_cost = v === "" ? null : parseFloat(v);
              return true;
            },
            editable: true,
          },
          {
            headerName: "+/-",
            valueGetter: (params: any) =>
              (params.data.actuals?.labor_cost || 0) -
              (params.data.labor_cost || 0),
          },
        ],
      },
      {
        headerName: "Material",
        hide: !selectedColumns.includes("material"),
        children: [
          {
            headerName: "cost",
            field: "actuals.material_cost",
            valueGetter: (params: any) =>
              params.data.actuals?.material_cost ?? "",
            valueSetter: (params: any) => {
              const v = params.newValue;
              params.data.actuals.material_cost =
                v === "" ? null : parseFloat(v);
              return true;
            },
            editable: true,
          },
          {
            headerName: "+/-",
            valueGetter: (params: any) =>
              (params.data.actuals?.material_cost || 0) -
              (params.data.material_cost || 0),
          },
        ],
      },
      {
        headerName: "Equipment",
        hide: !selectedColumns.includes("equipment"),
        children: [
          {
            headerName: "cost",
            field: "actuals.equipment_cost",
            valueGetter: (params: any) =>
              params.data.actuals?.equipment_cost ?? "",
            valueSetter: (params: any) => {
              const v = params.newValue;
              params.data.actuals.equipment_cost =
                v === "" ? null : parseFloat(v);
              return true;
            },
            editable: true,
          },
          {
            headerName: "+/-",
            valueGetter: (params: any) =>
              (params.data.actuals?.equipment_cost || 0) -
              (params.data.equipment_cost || 0),
          },
        ],
      },
      {
        headerName: "Total",
        valueGetter: (params: any) =>
          (params.data.actuals?.labor_cost || 0) +
          (params.data.actuals?.material_cost || 0) +
          (params.data.actuals?.equipment_cost || 0),
        hide: !selectedColumns.includes("total"),
      },
      {
        headerName: "Over/Under",
        field: "overUnder",
        hide: !selectedColumns.includes("overUnder"),
      },
      {
        headerName: "Actions",
        cellRenderer: ActionsRenderer,
        hide: !selectedColumns.includes("actions"),
      },
    ];
    return allDefs;
  }, [selectedColumns, router]); // Dependencies

  // Render
  return loadingAct ? (
    <ActivityTableSkeleton />
  ) : errorAct ? (
    <div>Error fetching activities.</div>
  ) : (
    <div>
      {/* Edit Modal */}
      {showEditForm && activityToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6">
            <EditActivityForm
              activity={activityToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {/* Customize Columns */}
      <div className="flex items-center justify-between mb-4 mt-6">
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
      </div>

      {/* AG Grid Table */}
      <div
        className="ag-theme-alpine custom-grid"
        style={{ height: 400, width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={extendedActivities}
          columnDefs={columnDefs}
          onCellValueChanged={handleCellValueChanged}
          domLayout="autoHeight"
          theme="legacy"
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 100,
            cellStyle: { border: "1px solid #d1d5db" },
          }}
        />
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this activity?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-gray-700">
          Showing {extendedActivities.length} rows
        </span>
      </div>
      <style jsx global>{`
        .custom-grid .ag-header-cell {
          background-color: #0e7490 !important; /* cyan-700 */
          color: #f3f4f6 !important; /* gray-100 */
          border: 1px solid #d1d5db !important; /* gray-300 */
        }
        .custom-grid .ag-header-cell:hover {
          background-color: #155e75 !important; /* cyan-800 */
        }

        /* group headers (Labor / Material / Equipment) */
        .custom-grid .ag-header-group-cell {
          background-color: #0e7490 !important; /* cyan-700 */
          color: #f3f4f6 !important; /* gray-100 */
          border: 1px solid #d1d5db !important;
        }
        .custom-grid .ag-header-group-cell:hover {
          background-color: #155e75 !important; /* cyan-800 */
        }

        /* Filter icon color - target svg, font icons and path fill/stroke */
        .custom-grid .ag-header-cell .ag-icon,
        .custom-grid .ag-header-cell .ag-icon-filter,
        .custom-grid .ag-header-cell .ag-filter-button svg,
        .custom-grid .ag-header-cell .ag-filter-button path {
          color: #f3f4f6 !important;
          fill: #f3f4f6 !important;
          stroke: #f3f4f6 !important;
        }

        /* ensure header text for group looks same */
        .custom-grid .ag-header-group-cell .ag-header-group-cell-label {
          color: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
};

export default ActualActivityTable;
