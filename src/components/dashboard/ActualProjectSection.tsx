"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { FaEdit, FaTrash, FaEye, FaTasks } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  useProjects,
  useDeleteProject,
  useUpdateProject,
  useUpdateProjectActuals,
} from "@/hooks/useProjects";
import { UpdateProjectInput, Project, ProjectActuals } from "@/types/project";
import { User } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";
import EditProjectForm from "../forms/EditProjectForm";
import ManageProjectForm from "../forms/ManageProjectForm";
import ConfirmModal from "../common/ui/ConfirmModal";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Link from "next/link";
import SearchInput from "../common/ui/SearchInput";
import ProfileAvatar from "../common/ProfileAvatar";
import {
  formatDate,
  getDateDuration,
  getDuration as calcRemaining,
} from "@/utils/dateUtils";
import { toast } from "react-toastify";
import { useSettingsStore } from "@/store/settingsStore";

const ActualProjectSection: React.FC = () => {
  const { useEthiopianDate } = useSettingsStore();
  const router = useRouter();
  const { data: projects, isLoading, isError } = useProjects();
  const { data: users } = useUsers();
  const gridRef = useRef<AgGridReact>(null);

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: updateProjectActuals } = useUpdateProjectActuals();

  // Column-customization state
  const columnOptions: Record<string, string> = {
    id: "ID",
    title: "Project",
    members: "Assigned To",
    client: "Client",
    priority: "Priority",
    budget: "Budget",
    start_date: "Starts At",
    end_date: "Ends At",
    duration: "Duration",
    remaining: "Remaining",
    progress: "Progress",
    status: "Status",
    actions: "Actions",
  };
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Edit/manage/delete modals state
  const [showEditForm, setShowEditForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<UpdateProjectInput | null>(
    null
  );
  const [showManageForm, setShowManageForm] = useState(false);
  const [projectToManage, setProjectToManage] = useState<UpdateProjectInput | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
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

  // Search integration with AG Grid quick filter
  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.getQuickFilter();
    }
  }, [searchTerm]);

  const defaultActuals: ProjectActuals = {
    start_date: null,
    end_date: null,
    progress: null,
    status: null,
    budget: null,
  };

  // Extended projects with actuals handling
  const extendedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.map((project) => ({
      ...project,
      actuals: { ...defaultActuals, ...(project.actuals || {}) },
    }));
  }, [projects]);

  // Column toggle
  const toggleColumn = (col: string) =>
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );

  // Handlers
  const handleDeleteProjectClick = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    if (project?.tasks && project.tasks.length > 0) {
      toast.error(
        "Cannot delete project with tasks. Please delete all tasks first."
      );
      return;
    }
    setSelectedProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProject = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleEditClick = (proj: Project) => {
    setProjectToEdit({
      ...proj,
      members: proj.members?.map((m) => m.id),
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: UpdateProjectInput) => {
    updateProject(data);
    setShowEditForm(false);
  };

  const handleManageClick = (proj: Project) => {
    setProjectToManage({
      ...proj,
      members: proj.members?.map((m) => m.id),
      budget: 0,
    });
    setShowManageForm(true);
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

  // Custom cell renderer for members avatars
  const MembersRenderer = (params: any) => {
    const members = params.value || [];
    if (!members.length) return <span>N/A</span>;
    return (
      <div className="flex -space-x-2">
        {members.map((user: User) => (
          <ProfileAvatar key={user.id} user={user} />
        ))}
      </div>
    );
  };

  // Custom cell renderer for project title link
  const TitleRenderer = (params: any) => {
    return (
      <Link
        href={`/projects/${params.data.id}`}
        className="text-cyan-700 hover:underline"
      >
        {params.value}
      </Link>
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
                onClick={() => handleEditClick(params.data)}
                className={`block w-full px-4 py-2 text-left ${
                  active ? "bg-blue-100" : ""
                }`}
              >
                <FaEdit className="inline mr-2" /> Edit
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                onClick={() => handleDeleteProjectClick(params.data.id)}
                className={`block w-full px-4 py-2 text-left ${
                  active ? "bg-blue-100" : ""
                }`}
              >
                <FaTrash className="inline mr-2" /> Delete
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                onClick={() => handleViewProject(params.data.id)}
                className={`block w-full px-4 py-2 text-left ${
                  active ? "bg-blue-100" : ""
                }`}
              >
                <FaEye className="inline mr-2" /> Quick View
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button
                onClick={() => handleManageClick(params.data)}
                className={`block w-full px-4 py-2 text-left ${
                  active ? "bg-blue-100" : ""
                }`}
              >
                <FaTasks className="inline mr-2" /> Manage
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    );
  };

  // Sanitize actuals before sending to API
  const sanitizeProjectActualsForApi = (raw: any): ProjectActuals => {
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
    safe.budget = toNumberOrNull(safe.budget);
    safe.status = safe.status ?? null;
    return safe as ProjectActuals;
  };

  // Handle cell edit: Update actuals and save via API (sanitized)
  const handleCellValueChanged = (params: any) => {
    const { data, colDef, newValue } = params;
    const fieldParts = (colDef.field || "").split(".");
    if (fieldParts[0] === "actuals") {
      data.actuals = { ...(data.actuals || {}), [fieldParts[1]]: newValue };
      const sanitized = sanitizeProjectActualsForApi(data.actuals);
      data.actuals = sanitized;
      updateProjectActuals(
        { id: data.id, actuals: sanitized },
        {
          onError: (err: any) => {
            console.error("Failed to update actuals:", err);
          },
        }
      );
    }
    params.api.refreshCells({ rowNodes: [params.node], force: true });
  };

  // Dynamic columnDefs based on selectedColumns
  const columnDefs = useMemo(() => {
    const allDefs: any[] = [
      {
        headerName: "ID",
        valueGetter: (params: any) => params.node.rowIndex + 1,
        hide: !selectedColumns.includes("id"),
      },
      {
        headerName: "Project",
        field: "title",
        cellRenderer: TitleRenderer,
        hide: !selectedColumns.includes("title"),
      },
      {
        headerName: "Assigned To",
        field: "members",
        cellRenderer: MembersRenderer,
        hide: !selectedColumns.includes("members"),
      },
      {
        headerName: "Client",
        field: "client",
        hide: !selectedColumns.includes("client"),
      },
      {
        headerName: "Priority",
        field: "priority",
        hide: !selectedColumns.includes("priority"),
      },
      {
        headerName: "Budget",
        hide: !selectedColumns.includes("budget"),
        children: [
          {
            headerName: "Actual",
            field: "actuals.budget",
            valueGetter: (params: any) => params.data.actuals?.budget ?? "",
            valueSetter: (params: any) => {
              const v = params.newValue;
              params.data.actuals.budget = v === "" ? null : parseFloat(v);
              return true;
            },
            editable: true,
          },
          {
            headerName: "+/-",
            valueGetter: (params: any) =>
              (params.data.actuals?.budget || 0) - (params.data.budget || 0),
          },
        ],
      },
      {
        headerName: "Starts At",
        field: "actuals.start_date",
        valueGetter: (params: any) => {
          const date = params.data.actuals?.start_date;
          if (!date) return "";
          const d = new Date(date);
          return isNaN(d.getTime()) ? "" : formatDate(date, useEthiopianDate);
        },
        valueSetter: (params: any) => {
          params.data.actuals.start_date = params.newValue || null;
          return true;
        },
        editable: true,
        cellEditor: "agDateCellEditor",
        hide: !selectedColumns.includes("start_date"),
      },
      {
        headerName: "Ends At",
        field: "actuals.end_date",
        valueGetter: (params: any) => {
          const date = params.data.actuals?.end_date;
          if (!date) return "";
          const d = new Date(date);
          return isNaN(d.getTime()) ? "" : formatDate(date, useEthiopianDate);
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
          const duration = getDateDuration(start, end);
          return `${duration}`;
        },
        hide: !selectedColumns.includes("duration"),
      },
      {
        headerName: "Remaining",
        valueGetter: (params: any) => {
          const end = params.data.actuals?.end_date;
          if (end && new Date(end) > new Date()) {
            return calcRemaining(new Date(), end);
          }
          return "N/A";
        },
        hide: !selectedColumns.includes("remaining"),
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
          ],
        },
        hide: !selectedColumns.includes("status"),
      },
      {
        headerName: "Actions",
        cellRenderer: ActionsRenderer,
        hide: !selectedColumns.includes("actions"),
      },
    ];
    return allDefs;
  }, [selectedColumns, useEthiopianDate]);

  if (isLoading) return <div>Loading projects…</div>;
  if (isError) return <div>Error loading projects.</div>;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>
      <div ref={menuRef} className="flex items-center justify-between mb-4">
        <div className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-5 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
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
        <SearchInput
          placeholder="Search Projects"
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {/* AG Grid Table */}
      <div
        className="ag-theme-alpine custom-grid"
        style={{ height: 400, width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={extendedProjects}
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
          message="Are you sure you want to delete this project?"
          showInput={false}
          confirmText="DELETE"
          confirmButtonText="Delete"
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
        />
      )}

      {/* Edit Modal */}
      {showEditForm && projectToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl m-4 max-h-[90vh] overflow-y-auto">
            <EditProjectForm
              project={projectToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
              users={users}
            />
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {/* {showManageForm && projectToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
            <ManageProjectForm
              project={projectToManage}
              onSubmit={handleManageSubmit}
              onClose={() => setShowManageForm(false)}
            />
          </div>
        </div>
      )} */}

      {/* Footer */}
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-gray-700">
          Showing {extendedProjects.length} rows
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

        /* group headers (Budget) */
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

export default ActualProjectSection;
