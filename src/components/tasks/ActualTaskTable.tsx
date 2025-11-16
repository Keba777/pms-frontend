// components/ActualTaskTable.tsx
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";

import {
  useTasks,
  useDeleteTask,
  useUpdateTask,
  useUpdateTaskActuals,
} from "@/hooks/useTasks";
import { Task, UpdateTaskInput, TaskActuals } from "@/types/task";
import EditTaskForm from "@/components/forms/EditTaskForm";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import SearchInput from "../common/ui/SearchInput";
import GenericDownloads from "@/components/common/GenericDownloads";

const defaultActuals: TaskActuals = {
  start_date: null,
  end_date: null,
  progress: null,
  status: null,
  budget: null,
};

interface ExtendedTask extends Task {
  actuals: TaskActuals;
  duration?: number | "";
  remaining?: number | "";
}

const ActualTaskTable: React.FC = () => {
  const {
    data: tasks,
    isLoading: loadingTasks,
    error: errorTasks,
  } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateTaskActuals } = useUpdateTaskActuals();

  const router = useRouter();
  const gridRef = useRef<AgGridReact | null>(null);

  const columnOptions: Record<string, string> = {
    id: "ID",
    task_name: "Task",
    assignedUsers: "Assigned To",
    priority: "Priority",
    start_date: "Start Date",
    end_date: "End Date",
    duration: "Duration",
    remaining: "Remaining",
    budget: "Budget",
    progress: "Progress",
    status: "Status",
    actions: "Actions",
  };

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<UpdateTaskInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // Dirty tracking for saves
  const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Grid data state to hold local edits
  const [gridData, setGridData] = useState<ExtendedTask[]>([]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const priorityBadgeClasses: Record<Task["priority"], string> = {
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };
  const statusBadgeClasses: Record<Task["status"], string> = {
    "Not Started": "bg-gray-100 text-gray-800",
    Started: "bg-blue-100 text-blue-800",
    InProgress: "bg-yellow-100 text-yellow-800",
    Onhold: "bg-amber-100 text-amber-800",
    Canceled: "bg-red-100 text-red-800",
    Completed: "bg-green-100 text-green-800",
  };

  // Prepare tasks with default actuals and computed fields
  const extendedTasks: ExtendedTask[] = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((t) => {
      const actuals = { ...defaultActuals, ...(t.actuals || {}) };
      let duration: number | "" = "";
      if (actuals.start_date && actuals.end_date) {
        const d = Math.ceil(
          (new Date(actuals.end_date).getTime() - new Date(actuals.start_date).getTime()) /
            (1000 * 3600 * 24)
        );
        duration = isNaN(d) ? "" : d;
      }
      let remaining: number | "" = "";
      if (actuals.end_date) {
        const r = Math.ceil((new Date(actuals.end_date).getTime() - Date.now()) / (1000 * 3600 * 24));
        remaining = isNaN(r) ? "" : r;
      }
      return {
        ...t,
        actuals,
        duration,
        remaining,
      };
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

  const handleViewTask = (id: string) => router.push(`/tasks/${id}`);

  const handleEditClick = (item: Task) => {
    setTaskToEdit({
      ...item,
      assignedUsers: item.assignedUsers?.map((u) => u.id),
    });
    setShowEditForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedTaskId(id);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (selectedTaskId) deleteTask(selectedTaskId);
    setIsDeleteModalOpen(false);
  };
  const handleEditSubmit = (data: UpdateTaskInput) => {
    updateTask(data);
    setShowEditForm(false);
  };

  // Progress bar renderer
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

  // Actions menu
  const ActionsRenderer = (params: any) => {
    const data: Task = params.data;
    return (
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
          Action <ChevronDown className="w-4 h-4" />
        </MenuButton>
        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-4 py-2 text-left ${active ? "bg-blue-100" : ""}`}
                onClick={() => handleEditClick(data)}
              >
                Update
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-4 py-2 text-left ${active ? "bg-blue-100" : ""}`}
                onClick={() => handleDeleteClick(data.id)}
              >
                Delete
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                className={`block w-full px-4 py-2 text-left ${active ? "bg-blue-100" : ""}`}
                onClick={() => handleViewTask(data.id)}
              >
                Quick View
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

  // sanitize actuals for API
  const sanitizeActualsForApi = (raw: any): TaskActuals => {
    const safe = { ...(raw || {}) } as any;
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
    safe.budget = safe.budget === "" || safe.budget === null ? null : toNumberOrNull(safe.budget);
    safe.status = safe.status ?? null;
    return safe as TaskActuals;
  };

  // On cell value changed (only for actuals.* fields we push patch)
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
            onError: (err: any) => {
              console.error("Failed to update task actuals:", err);
            },
          }
        );
      }
    });
    setDirtyRows(new Set());
    setIsSaving(false);
  };

  // Column definitions
  const columnDefs = useMemo(() => {
    const defs: any[] = [
      {
        headerName: "ID",
        valueGetter: (params: any) => `TK${String(params.node.rowIndex + 1).padStart(3, "0")}`,
        hide: !selectedColumns.includes("id"),
        maxWidth: 90,
      },
      {
        headerName: "Task",
        field: "task_name",
        cellRenderer: NameRenderer,
        hide: !selectedColumns.includes("task_name"),
        minWidth: 150,
      },
      {
        headerName: "Assigned To",
        field: "assignedUsers",
        valueGetter: (params: any) => (params.data.assignedUsers || []).map((u: any) => u.name).join(", "),
        cellRenderer: (params: any) => {
          const users = params.data.assignedUsers || [];
          if (!users.length) return "N/A";
          return (
            <div className="avatars flex items-center gap-2">
              {users.slice(0, 5).map((u: any) => (
                <div key={u.id} className="flex items-center" title={u.name}>
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
                    <ProfileAvatar user={u} />
                  </div>
                </div>
              ))}
              {users.length > 5 && <span className="text-sm text-gray-500">+{users.length - 5}</span>}
            </div>
          );
        },
        hide: !selectedColumns.includes("assignedUsers"),
        minWidth: 120,
        cellClass: "assigned-cell",
      },
      {
        headerName: "Priority",
        field: "priority",
        cellRenderer: (params: any) => (
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[params.value as Task['priority']]}`}>
            {params.value}
          </span>
        ),
        hide: !selectedColumns.includes("priority"),
        maxWidth: 120,
      },

      // actuals.start_date
      {
        headerName: "Start Date",
        field: "actuals.start_date",
        valueGetter: (params: any) => {
          const d = params.data.actuals?.start_date;
          if (!d) return "";
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString();
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

      // actuals.end_date
      {
        headerName: "End Date",
        field: "actuals.end_date",
        valueGetter: (params: any) => {
          const d = params.data.actuals?.end_date;
          if (!d) return "";
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString();
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

      // Duration
      {
        headerName: "Duration",
        valueGetter: (params: any) => {
          const start = params.data.actuals?.start_date;
          const end = params.data.actuals?.end_date;
          if (!start || !end) return "";
          const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24));
          return isNaN(diff) ? "" : diff;
        },
        hide: !selectedColumns.includes("duration"),
        minWidth: 110,
      },

      // Remaining
      {
        headerName: "Remaining",
        valueGetter: (params: any) => {
          const end = params.data.actuals?.end_date;
          if (!end) return "";
          const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 3600 * 24));
          return isNaN(diff) ? "" : diff;
        },
        hide: !selectedColumns.includes("remaining"),
        minWidth: 110,
      },

      // Budget
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

      // Progress
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

      // Status
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
          values: ["Not Started", "Started", "InProgress", "Onhold", "Canceled", "Completed", null],
        },
        hide: !selectedColumns.includes("status"),
        maxWidth: 160,
      },

      {
        headerName: "Actions",
        cellRenderer: ActionsRenderer,
        hide: !selectedColumns.includes("actions"),
        maxWidth: 140,
      },
    ];

    return defs;
  }, [selectedColumns, router]);

  if (loadingTasks) return <div>Loading tasks...</div>;
  if (errorTasks) return <div>Error fetching tasks.</div>;

  return (
    <div>
      <div className="mt-2 mb-4">
        <GenericDownloads<Task>
          data={filtered}
          title="Actual Task Report"
          columns={Object.entries(columnOptions)
            .filter(([k]) => selectedColumns.includes(k))
            .map(([key, label]) => {
              if (key === "remaining") {
                return {
                  header: label,
                  accessor: (row: Task) => row.actuals?.end_date ?? row.end_date,
                };
              }
              if (key === "budget") {
                return {
                  header: label,
                  accessor: (row: Task) => row.actuals?.budget ?? row.budget ?? 0,
                };
              }
              return {
                header: label,
                accessor: key as keyof Task,
              };
            })}
        />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label key={key} className="flex items-center w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() =>
                      setSelectedColumns((prev) =>
                        prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
                      )
                    }
                    className="mr-2"
                  />
                  {label || <span>&nbsp;</span>}
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
        <SearchInput placeholder="Search tasks..." value={search} onChange={setSearch} />
      </div>

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
            minWidth: 110,
            cellStyle: { border: "0.5px solid rgba(209,213,219,0.8)", padding: "8px 10px" },
          }}
        />
      </div>

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this task?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      {showEditForm && taskToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <EditTaskForm task={taskToEdit} onSubmit={handleEditSubmit} onClose={() => setShowEditForm(false)} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-[#697a8d]">Showing {filtered.length} rows</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-50">&lsaquo;</button>
          <button className="px-3 py-1 rounded border bg-gray-100">1</button>
          <button className="px-3 py-1 rounded border hover:bg-gray-50">&rsaquo;</button>
        </div>
      </div>

      <style jsx global>{`
        .custom-grid .ag-header-cell {
          background-color: #0e7490 !important; /* cyan-700 */
          color: #f3f4f6 !important; /* gray-100 */
          border: 0.5px solid rgba(209,213,219,0.9) !important;
        }
        .custom-grid .ag-header-cell:hover {
          background-color: #155e75 !important; /* cyan-800 */
        }
        /* add bottom padding so header text isn't cut */
        .custom-grid .ag-header-cell, .custom-grid .ag-header-cell .ag-header-cell-label {
          padding: 8px 10px !important;
          height: 58px !important;
          display: flex;
          align-items: center;
          
        }
        /* body cells styling (text color and thinner border) */
        .custom-grid .ag-cell {
          padding: 4px 10px !important;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #697a8d !important;
          border-bottom: 0.5px solid rgba(209,213,219,0.8) !important;
        }
        /* assigned users avatars container */
        .custom-grid .assigned-cell .avatars {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
        }
        .custom-grid .assigned-cell .avatars > div {
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          overflow: hidden;
          border-radius: 9999px;
        }
        .custom-grid .ag-header-group-cell {
          background-color: #0e7490 !important;
          color: #f3f4f6 !important;
          border: 0.5px solid rgba(209,213,219,0.9) !important;
        }
        .custom-grid .ag-header-cell .ag-icon,
        .custom-grid .ag-header-cell .ag-icon-filter,
        .custom-grid .ag-header-cell .ag-filter-button svg,
        .custom-grid .ag-header-cell .ag-filter-button path {
          color: #f3f4f6 !important;
          fill: #f3f4f6 !important;
          stroke: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
};

export default ActualTaskTable;
