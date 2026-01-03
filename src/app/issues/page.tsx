"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useIssues, useUpdateIssue, useDeleteIssue } from "@/hooks/useIssues";
import { formatDate as format } from "@/utils/dateUtils";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Issue } from "@/types/issue";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import ConfirmModal from "@/components/common/ui/ConfirmModal";
import EditIssueForm from "@/components/forms/EditIssueForm";

const priorityBadgeClasses: Record<Issue["priority"], string> = {
  Urgent: "bg-destructive/10 text-destructive",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-primary/10 text-primary",
};

const statusBadgeClasses: Record<Issue["status"], string> = {
  Open: "bg-muted text-muted-foreground",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-primary/10 text-primary",
  Closed: "bg-primary/20 text-primary",
};

const columnOptions: Record<string, string> = {
  date: "Date",
  issueType: "Issue Type",
  description: "Description",
  raisedBy: "Raised By",
  priority: "Priority",
  site: "Site",
  department: "Department",
  responsible: "Responsible",
  actionTaken: "Action Taken",
  status: "Status",
  action: "Action",
};

const IssuesPage = () => {
  const router = useRouter();
  const {
    data: issues,
    isLoading: issueLoading,
    error: issueError,
  } = useIssues();
  const { mutate: deleteIssue } = useDeleteIssue();
  const { mutate: updateIssue } = useUpdateIssue();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();
  const {
    data: departments,
    isLoading: deptLoading,
    error: deptError,
  } = useDepartments();

  // Filters (non-date filters handled by GenericFilter)
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Custom date filters (separate from GenericFilter as requested)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null);

  // Close column menu when clicking outside (fixed listener cleanup)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleDelete = () => {
    if (selectedIssueId) {
      deleteIssue(selectedIssueId);
      setIsDeleteModalOpen(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/issues/${id}`);
  };

  const handleEditClick = (issue: Issue) => {
    setIssueToEdit(issue);
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: any) => {
    updateIssue(data);
    setShowEditForm(false);
  };

  // Utility to set start of day and end of day for inclusive filtering
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  // Compute filteredIssues using useMemo, with proper date handling
  const filteredIssues = useMemo(() => {
    if (!issues) return [];

    return issues.filter((i: Issue) => {
      let matches = true;

      if (filterValues.issueType) {
        matches =
          matches &&
          i.issueType
            .toLowerCase()
            .includes((filterValues.issueType as string).toLowerCase());
      }
      if (filterValues.priority) {
        matches = matches && i.priority === filterValues.priority;
      }
      if (filterValues.status) {
        matches = matches && i.status === filterValues.status;
      }

      // Date filtering (our own datepickers). Works if either/both provided.
      if (startDate || endDate) {
        const issueDate = i.date ? new Date(i.date) : null;
        if (!issueDate) return false; // if issue has no date, exclude when date filter is active

        if (startDate) {
          const s = startOfDay(startDate);
          matches = matches && issueDate >= s;
        }
        if (endDate) {
          const e = endOfDay(endDate);
          matches = matches && issueDate <= e;
        }
      }

      return matches;
    });
  }, [filterValues, issues, startDate, endDate]);

  // Combine loading and error states
  const isLoading = issueLoading || siteLoading || deptLoading;
  const isError = issueError || siteError || deptError;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading data.</div>;

  // Status summary values based on full issues list
  const total = issues?.length ?? 0;
  const openCount = issues?.filter((i) => i.status === "Open").length ?? 0;
  const inProgressCount =
    issues?.filter((i) => i.status === "In Progress").length ?? 0;
  const resolvedCount =
    issues?.filter((i) => i.status === "Resolved").length ?? 0;
  const closedCount = issues?.filter((i) => i.status === "Closed").length ?? 0;

  // Define download columns
  const columns: Column<Issue>[] = [
    {
      header: "Date",
      accessor: (row: Issue) =>
        row.date ? new Date(row.date).toISOString().split("T")[0] : "-",
    },
    { header: "Issue Type", accessor: "issueType" },
    { header: "Description", accessor: "description" },
    {
      header: "Raised By",
      accessor: (row: Issue) => row.raisedBy?.first_name || "-",
    },
    {
      header: "Priority",
      accessor: (row: Issue) => row.priority || "-",
    },
    {
      header: "Site",
      accessor: (row: Issue) =>
        sites?.find((s) => s.id === row.siteId)?.name || "-",
    },
    {
      header: "Department",
      accessor: (row: Issue) =>
        departments?.find((d) => d.id === row.departmentId)?.name || "-",
    },
    {
      header: "Responsible",
      accessor: (row: Issue) => row.responsible?.first_name || "-",
    },
    {
      header: "Action Taken",
      accessor: (row: Issue) => row.actionTaken || "-",
    },
    { header: "Status", accessor: "status" },
  ];

  // Filter options
  const priorityOptions: Option<string>[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "Urgent", value: "Urgent" },
  ];
  const statusOptions: Option<string>[] = [
    { label: "Open", value: "Open" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
    { label: "Closed", value: "Closed" },
  ];

  // Filter fields (removed date fields from generic filter as requested)
  const filterFields: FilterField<string>[] = [
    {
      name: "issueType",
      label: "Issue Type",
      type: "text",
      placeholder: "Search by issue type…",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: priorityOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-background shadow-lg rounded-lg mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Open", value: openCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Resolved", value: resolvedCount },
          { label: "Closed", value: closedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{item.label}</h2>
            <span className="text-2xl font-black text-primary">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {/* Top Actions & Filters */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Issues</h1>
          <GenericDownloads
            data={filteredIssues}
            title="Issues_List"
            columns={columns}
          />
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div ref={menuRef} className="relative w-full lg:w-auto">
            <button
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-bold"
            >
              Customize Columns <ChevronDown className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-border/50 mb-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Visible Columns</span>
                </div>
                {Object.entries(columnOptions).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center w-full px-4 py-2 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(key)}
                      onChange={() => toggleColumn(key)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary mr-3"
                    />
                    <span className="text-sm text-foreground font-bold">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <GenericFilter
              fields={filterFields}
              onFilterChange={setFilterValues}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-primary/5 p-4 rounded-xl border border-primary/20">
        <span className="text-xs font-black uppercase text-primary whitespace-nowrap">Date Filter:</span>
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex-1 min-w-[140px]">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              placeholderText="From Date"
              isClearable
              dateFormat="yyyy-MM-dd"
              className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:ring-2 focus:ring-primary font-bold bg-background text-foreground"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              placeholderText="To Date"
              isClearable
              dateFormat="yyyy-MM-dd"
              className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:ring-2 focus:ring-primary font-bold bg-background text-foreground"
            />
          </div>
          <button
            onClick={clearDates}
            className="px-6 py-2 text-sm font-bold text-muted-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors shadow-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <p className="text-muted-foreground">No issues found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border border border-border">
            <thead className="bg-primary">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                  #
                </th>
                {selectedColumns.includes("date") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Date
                  </th>
                )}
                {selectedColumns.includes("issueType") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Issue Type
                  </th>
                )}
                {selectedColumns.includes("description") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Description
                  </th>
                )}
                {selectedColumns.includes("raisedBy") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Raised By
                  </th>
                )}
                {selectedColumns.includes("priority") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Priority
                  </th>
                )}
                {selectedColumns.includes("site") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Site
                  </th>
                )}
                {selectedColumns.includes("department") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Department
                  </th>
                )}
                {selectedColumns.includes("responsible") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Responsible
                  </th>
                )}
                {selectedColumns.includes("actionTaken") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Action Taken
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Status
                  </th>
                )}
                {selectedColumns.includes("action") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredIssues.map((issue, idx) => (
                <tr key={issue.id}>
                  <td className="px-4 py-2 border border-border">
                    {idx + 1}
                  </td>
                  {selectedColumns.includes("date") && (
                    <td className="px-4 py-2 border border-border">
                      {issue.date
                        ? format(issue.date)
                        : "-"}
                    </td>
                  )}
                  {selectedColumns.includes("issueType") && (
                    <td className="px-4 py-2 border border-border">
                      {issue.issueType}
                    </td>
                  )}
                  {selectedColumns.includes("description") && (
                    <td className="px-4 py-2 border border-border">
                      {issue.description}
                    </td>
                  )}
                  {selectedColumns.includes("raisedBy") && (
                    <td className="px-4 py-2 border border-border">
                      {issue.raisedBy?.first_name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("priority") && (
                    <td className="px-4 py-2 border border-border">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${priorityBadgeClasses[issue.priority]
                          }`}
                      >
                        {issue.priority || "-"}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("site") && (
                    <td className="px-4 py-2 border border-border">
                      {sites?.find((s) => s.id === issue.siteId)?.name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("department") && (
                    <td className="px-4 py-2 border border-border">
                      {departments?.find((d) => d.id === issue.departmentId)
                        ?.name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("responsible") && (
                    <td className="px-4 py-2 border border-border">
                      {issue.responsible?.first_name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("actionTaken") && (
                    <td className="px-4 py-2 border border-border">
                      {issue.actionTaken || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-border">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${statusBadgeClasses[issue.status]
                          }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("action") && (
                    <td className="px-4 py-2 border border-border">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute left-0 mt-2 w-full origin-top-left bg-card border border-border divide-y divide-border rounded-md shadow-lg focus:outline-none z-50">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleView(issue.id)}
                                className={`${active ? "bg-accent" : ""
                                  } w-full text-left px-3 py-2 text-sm text-foreground`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => handleEditClick(issue)}
                                className={`${active ? "bg-accent" : ""
                                  } w-full text-left px-3 py-2 text-sm text-foreground`}
                              >
                                Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  setSelectedIssueId(issue.id);
                                  setIsDeleteModalOpen(true);
                                }}
                                className={`${active ? "bg-accent" : ""
                                  } w-full text-left px-3 py-2 text-sm text-destructive`}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          isVisible={isDeleteModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to delete this issue?"
          confirmText="DELETE"
          confirmButtonText="Delete"
          showInput={false}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
      {showEditForm && issueToEdit && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-background rounded-lg shadow-xl p-6">
            <EditIssueForm
              issue={issueToEdit}
              onSubmit={handleEditSubmit}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
