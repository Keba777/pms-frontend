// components/ActualTaskTable.tsx
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { Task, UpdateTaskInput, TaskActuals } from "@/types/task";
import {
  useDeleteTask,
  useUpdateTask,
  useUpdateTaskActuals,
  useTasks,
} from "@/hooks/useTasks";
import EditTaskForm from "../forms/EditTaskForm";
import ManageTaskForm from "../forms/ManageTaskForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import GenericDownloads, { Column } from "../common/GenericDownloads";
import SearchInput from "../common/ui/SearchInput";
import ProfileAvatar from "../common/ProfileAvatar";
import { toast } from "react-toastify";
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";

interface ActualTaskTableProps {
  tasks: Task[];
  projectId?: string;
}

const HEADER_BG = "#0e7490"; // same as activity table (cyan-700)
const ACTION_BG = "bg-cyan-700"; // tailwind class used for action buttons

const defaultActuals: TaskActuals = {
  start_date: null,
  end_date: null,
  progress: null,
  status: null,
  budget: null,
};

export default function ActualTaskTable({
  tasks,
  projectId,
}: ActualTaskTableProps) {
  const { useEthiopianDate } = useSettingsStore();
  const router = useRouter();
  const gridRef = useRef<AgGridReact | null>(null);

  // hooks (delete/update)
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateTaskActuals } = useUpdateTaskActuals();

  // local UI state
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [showManageForm, setShowManageForm] = useState(false);
  const [taskToManage, setTaskToManage] = useState<UpdateTaskInput | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "no",
    "task_name",
    "start_date",
    "end_date",
    "duration",
    "remaining",
    "budget",
    "progress",
    "status",
    "actions",
  ]);

  // Dirty tracking for saves
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Grid data state to hold local edits
  const [gridData, setGridData] = useState<Task[]>([]);

  // compute extendedTasks with actuals defaults + duration/remaining
  const extendedTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((t) => {
      const actuals: TaskActuals = { ...defaultActuals, ...(t.actuals || {}) };
      let duration: number | "" = "";
      if (actuals.start_date && actuals.end_date) {
        const d = Math.ceil(
          (new Date(actuals.end_date).getTime() -
            new Date(actuals.start_date).getTime()) /
            (1000 * 3600 * 24)
        );
        duration = isNaN(d) ? "" : d;
      }
      let remaining: number | "" = "";
      if (actuals.end_date) {
        const r = Math.ceil(
          (new Date(actuals.end_date).getTime() - Date.now()) /
            (1000 * 3600 * 24)
        );
        remaining = isNaN(r) ? "" : r;
      }
      return { ...t, actuals, duration, remaining };
    });
  }, [tasks]);

  // Sync gridData when extendedTasks change
  useEffect(() => {
    setGridData(extendedTasks);
    setDirtyRows(new Set());
  }, [extendedTasks]);

  const filtered = gridData.filter((t) =>
    t.task_name.toLowerCase().includes(search.toLowerCase())
  );

  // --- helpers ---
  const sanitizeActualsForApi = (raw: any): TaskActuals => {
    const safe: any = { ...(raw || {}) };

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

    const toNumberOrNull = (v: any) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };
    safe.progress = toNumberOrNull(safe.progress);
    // budget can be number or string; store number or null
    safe.budget =
      safe.budget === "" || safe.budget === null
        ? null
        : toNumberOrNull(safe.budget);

    safe.status = safe.status ?? null;

    return safe as TaskActuals;
  };

  // actions
  const handleView = (id: string) => router.push(`/tasks/${id}`);
  const handleEditClick = (t: Task) => {
    setTaskToEdit({
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id),
    });
    setShowEditForm(true);
  };
  const handleEditSubmit = (data: UpdateTaskInput) => {
    updateTask(data, {
      onSuccess: () => toast.success("Task updated"),
      onError: () => toast.error("Failed to update task"),
    });
    setShowEditForm(false);
  };
  const handleManageClick = (t: Task) => {
    setTaskToManage({
      ...t,
      assignedUsers: t.assignedUsers?.map((u) => u.id),
    });
    setShowManageForm(true);
  };
  const handleManageSubmit = (data: UpdateTaskInput) => {
    updateTask(data, {
      onSuccess: () => toast.success("Task updated"),
      onError: () => toast.error("Failed to update task"),
    });
    setShowManageForm(false);
  };
  const handleDeleteClick = (taskId: string) => {
    const t = tasks.find((x) => x.id === taskId);
    if (t?.activities?.length) {
      toast.error(
        "Cannot delete task with activities. Delete activities first."
      );
      return;
    }
    setSelectedTaskId(taskId);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId, {
        onSuccess: () => toast.success("Task deleted"),
        onError: () => toast.error("Failed to delete task"),
      });
    }
    setIsDeleteModalOpen(false);
  };

  // Cell renderers
  const ProgressRenderer = (params: any) => {
    const value = params.value ?? 0;
    return (
      <div className="relative h-full bg-gray-200 rounded">
        <div
          className="absolute h-full bg-blue-600 rounded"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {value ?? 0}%
          </span>
        </div>
      </div>
    );
  };

  const ActionsRenderer = (params: any) => {
    const d: Task = params.data;
    return (
      <Menu as="div" className="relative inline-block text-left w-full">
        <MenuButton
          className={`flex items-center justify-between gap-1 px-3 py-1 text-sm ${ACTION_BG} text-white rounded`}
        >
          Actions <ChevronDown className="w-4 h-4" />
        </MenuButton>
        <MenuItems className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-10">
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-3 py-2 text-left ${
                  active ? "bg-blue-50" : ""
                }`}
                onClick={() => handleView(d.id)}
              >
                View
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-3 py-2 text-left ${
                  active ? "bg-blue-50" : ""
                }`}
                onClick={() => handleEditClick(d)}
              >
                Edit
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-3 py-2 text-left text-red-600 ${
                  active ? "bg-red-50" : ""
                }`}
                onClick={() => handleDeleteClick(d.id)}
              >
                Delete
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-3 py-2 text-left ${
                  active ? "bg-blue-50" : ""
                }`}
                onClick={() => handleManageClick(d)}
              >
                Manage
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    );
  };

  const NameRenderer = (params: any) => (
    <Link href={`/tasks/${params.data.id}`} className="hover:underline">
      {params.value}
    </Link>
  );

  // called when a cell is edited
  const handleCellValueChanged = (params: any) => {
    const { colDef } = params;
    const fieldParts = (colDef.field || "").split(".");
    if (fieldParts[0] === "actuals") {
      setDirtyRows((prev) => {
        const newSet = new Set(prev);
        newSet.add(params.data.id);
        return newSet;
      });
    }
    // refresh row to update calculated columns
    params.api.refreshCells({ rowNodes: [params.node], force: true });
  };

  // Handle save changes
  const handleSave = () => {
    setIsSaving(true);
    Array.from(dirtyRows).forEach((id) => {
      const row = gridData.find((r) => r.id === id);
      if (row) {
        const sanitized = sanitizeActualsForApi(row.actuals);
        updateTaskActuals(
          { id, actuals: sanitized },
          {
            onSuccess: () => {
              toast.success("Task actuals saved");
            },
            onError: (err: any) => {
              console.error("Failed to update task actuals", err);
              toast.error("Failed to save actuals");
            },
          }
        );
      }
    });
    setDirtyRows(new Set());
    setIsSaving(false);
  };

  // column definitions for AG Grid (only fields requested)
  const columnDefs = useMemo(() => {
    return [
      {
        headerName: "No",
        valueGetter: (params: any) => String(params.node.rowIndex + 1),
        hide: !selectedColumns.includes("no"),
        maxWidth: 90,
      },
      {
        headerName: "Task",
        field: "task_name",
        cellRenderer: NameRenderer,
        hide: !selectedColumns.includes("task_name"),
        minWidth: 240,
      },
      {
        headerName: "Start Date",
        field: "actuals.start_date",
        valueGetter: (params: any) => {
          const d = params.data.actuals?.start_date;
          if (!d) return "";
          return format(d, useEthiopianDate);
        },
        valueSetter: (params: any) => {
          params.data.actuals.start_date = params.newValue || null;
          return true;
        },
        editable: true,
        cellEditor: "agDateCellEditor",
        hide: !selectedColumns.includes("start_date"),
        minWidth: 130,
      },
      {
        headerName: "End Date",
        field: "actuals.end_date",
        valueGetter: (params: any) => {
          const d = params.data.actuals?.end_date;
          if (!d) return "";
          return format(d, useEthiopianDate);
        },
        valueSetter: (params: any) => {
          params.data.actuals.end_date = params.newValue || null;
          return true;
        },
        editable: true,
        cellEditor: "agDateCellEditor",
        hide: !selectedColumns.includes("end_date"),
        minWidth: 130,
      },
      {
        headerName: "Duration",
        valueGetter: (params: any) => {
          const start = params.data.actuals?.start_date;
          const end = params.data.actuals?.end_date;
          if (!start || !end) return "";
          const diff = Math.ceil(
            (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24)
          );
          return isNaN(diff) ? "" : diff;
        },
        hide: !selectedColumns.includes("duration"),
        minWidth: 110,
      },
      {
        headerName: "Remaining",
        valueGetter: (params: any) => {
          const end = params.data.actuals?.end_date;
          if (!end) return "";
          const diff = Math.ceil(
            (new Date(end).getTime() - Date.now()) / (1000 * 3600 * 24)
          );
          return isNaN(diff) ? "" : diff;
        },
        hide: !selectedColumns.includes("remaining"),
        minWidth: 110,
      },
      {
        headerName: "Budget",
        field: "actuals.budget",
        valueGetter: (params: any) => {
          const b = params.data.actuals?.budget ?? params.data.budget ?? null;
          return b === null || b === undefined ? "" : String(b);
        },
        valueSetter: (params: any) => {
          const v = params.newValue;
          params.data.actuals.budget = v === "" ? null : parseFloat(v);
          return true;
        },
        editable: true,
        hide: !selectedColumns.includes("budget"),
        minWidth: 120,
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
        maxWidth: 160,
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
            "Onhold",
            "Canceled",
            "Completed",
            null,
          ],
        },
        hide: !selectedColumns.includes("status"),
        maxWidth: 160,
      },
      {
        headerName: "Actions",
        cellRenderer: ActionsRenderer,
        hide: !selectedColumns.includes("actions"),
        maxWidth: 160,
      },
    ];
  }, [selectedColumns]);

  // download columns for GenericDownloads (keeps your existing behaviour)
  const downloadColumns: Column<Task>[] = [
    { header: "Task", accessor: "task_name" },
    {
      header: "Start Date",
      accessor: (r) =>
        r.actuals?.start_date
          ? format(r.actuals.start_date, useEthiopianDate)
          : "",
    },
    {
      header: "End Date",
      accessor: (r) =>
        r.actuals?.end_date
          ? format(r.actuals.end_date, useEthiopianDate)
          : "",
    },
    {
      header: "Duration",
      accessor: (r) => {
        const s = r.actuals?.start_date,
          e = r.actuals?.end_date;
        if (!s || !e) return "";
        const diff = Math.ceil(
          (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 3600 * 24)
        );
        return isNaN(diff) ? "" : String(diff);
      },
    },
    {
      header: "Remaining",
      accessor: (r) => {
        const e = r.actuals?.end_date;
        if (!e) return "";
        const diff = Math.ceil(
          (new Date(e).getTime() - Date.now()) / (1000 * 3600 * 24)
        );
        return isNaN(diff) ? "" : String(diff);
      },
    },
    { header: "Budget", accessor: (r) => r.actuals?.budget ?? r.budget ?? 0 },
    {
      header: "Progress",
      accessor: (r) => `${r.actuals?.progress ?? r.progress ?? 0}%`,
    },
    { header: "Status", accessor: (r) => r.actuals?.status ?? r.status },
  ];

  // header & default cell styling tuned to match Activity table
  if (!tasks) return <div>Loading tasks...</div>;

  return (
    <div>
      <div className="mb-3">
        <GenericDownloads
          data={filtered}
          title="Actual Tasks"
          columns={downloadColumns}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowColumnMenu((v) => !v)}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow z-10">
              {[
                ["no", "No"],
                ["task_name", "Task"],
                ["start_date", "Start Date"],
                ["end_date", "End Date"],
                ["duration", "Duration"],
                ["remaining", "Remaining"],
                ["budget", "Budget"],
                ["progress", "Progress"],
                ["status", "Status"],
                ["actions", "Actions"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() =>
                      setSelectedColumns((prev) =>
                        prev.includes(key)
                          ? prev.filter((c) => c !== key)
                          : [...prev, key]
                      )
                    }
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </div>
        {dirtyRows.size > 0 && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
        <SearchInput
          placeholder="Search tasks..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine custom-grid" style={{ width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={filtered}
          columnDefs={columnDefs}
          onCellValueChanged={handleCellValueChanged}
          domLayout="autoHeight"
          headerHeight={56}
          rowHeight={52}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 100,
            cellStyle: {
              border: "0.3px solid rgba(209,213,219,0.7)",
              padding: "6px 8px",
            },
          }}
        />
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this task?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {showEditForm && taskToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <EditTaskForm
              task={taskToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}

      {/* {showManageForm && taskToManage && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <ManageTaskForm
              task={taskToManage}
              onSubmit={handleManageSubmit}
              onClose={() => setShowManageForm(false)}
            />
          </div>
        </div>
      )} */}

      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-[#697a8d]">
          Showing {filtered.length} rows
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            &lsaquo;
          </button>
          <button className="px-3 py-1 rounded border bg-gray-100">1</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-50">
            &rsaquo;
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .custom-grid .ag-header-cell {
          background-color: ${HEADER_BG} !important;
          color: #f3f4f6 !important;
          border: 0.3px solid rgba(209, 213, 219, 0.7) !important;
          box-sizing: border-box;
        }
        .custom-grid .ag-header-cell:hover {
          background-color: #155e75 !important;
        }
        .custom-grid .ag-header-cell,
        .custom-grid .ag-header-cell .ag-header-cell-label {
          padding: 8px 10px !important;
          height: 56px !important;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
        }
        .custom-grid .ag-header-cell .ag-icon,
        .custom-grid .ag-header-cell .ag-icon-filter,
        .custom-grid .ag-header-cell .ag-filter-button svg,
        .custom-grid .ag-header-cell .ag-filter-button path {
          color: #f3f4f6 !important;
          fill: #f3f4f6 !important;
          stroke: #f3f4f6 !important;
        }
        .custom-grid .ag-cell {
          padding: 6px 8px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #697a8d !important;
          border-bottom: 0.3px solid rgba(209, 213, 219, 0.7) !important;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
