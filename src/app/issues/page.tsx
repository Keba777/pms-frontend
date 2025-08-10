"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useIssues } from "@/hooks/useIssues";
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

const priorityBadgeClasses: Record<Issue["priority"], string> = {
  Urgent: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-green-100 text-green-800",
};

const statusBadgeClasses: Record<Issue["status"], string> = {
  Open: "bg-gray-100 text-gray-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Resolved: "bg-blue-100 text-blue-800",
  Closed: "bg-green-100 text-green-800",
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
  const {
    data: issues,
    isLoading: issueLoading,
    error: issueError,
  } = useIssues();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();
  const {
    data: departments,
    isLoading: deptLoading,
    error: deptError,
  } = useDepartments();

  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close column menu when clicking outside
  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    });
    return () => document.removeEventListener("mousedown", () => {});
  }, []);

  // Compute filteredIssues using useMemo, with a fallback for when issues is undefined
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
      return matches;
    });
  }, [filterValues, issues]);

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

  // Filter fields
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex flex-wrap gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Open", value: openCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Resolved", value: resolvedCount },
          { label: "Closed", value: closedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="mr-2">{item.label} =</h2>
            <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {/* Top Actions */}
      <div className="flex justify-end mb-8">
        <GenericDownloads
          data={filteredIssues}
          title="Issues_List"
          columns={columns}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800"
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
                  {label || <span>&nbsp;</span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <GenericFilter
            fields={filterFields}
            onFilterChange={setFilterValues}
          />
        </div>
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Issues</h1>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <p className="text-gray-600">No issues found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                {selectedColumns.includes("date") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Date
                  </th>
                )}
                {selectedColumns.includes("issueType") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Issue Type
                  </th>
                )}
                {selectedColumns.includes("description") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Description
                  </th>
                )}
                {selectedColumns.includes("raisedBy") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Raised By
                  </th>
                )}
                {selectedColumns.includes("priority") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Priority
                  </th>
                )}
                {selectedColumns.includes("site") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Site
                  </th>
                )}
                {selectedColumns.includes("department") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Department
                  </th>
                )}
                {selectedColumns.includes("responsible") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Responsible
                  </th>
                )}
                {selectedColumns.includes("actionTaken") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Action Taken
                  </th>
                )}
                {selectedColumns.includes("status") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Status
                  </th>
                )}
                {selectedColumns.includes("action") && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map((issue, idx) => (
                <tr key={issue.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  {selectedColumns.includes("date") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {issue.date
                        ? new Date(issue.date).toLocaleDateString()
                        : "-"}
                    </td>
                  )}
                  {selectedColumns.includes("issueType") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {issue.issueType}
                    </td>
                  )}
                  {selectedColumns.includes("description") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {issue.description}
                    </td>
                  )}
                  {selectedColumns.includes("raisedBy") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {issue.raisedBy?.first_name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("priority") && (
                    <td className="px-4 py-2 border border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          priorityBadgeClasses[issue.priority]
                        }`}
                      >
                        {issue.priority || "-"}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("site") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {sites?.find((s) => s.id === issue.siteId)?.name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("department") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {departments?.find((d) => d.id === issue.departmentId)
                        ?.name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("responsible") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {issue.responsible?.first_name || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("actionTaken") && (
                    <td className="px-4 py-2 border border-gray-200">
                      {issue.actionTaken || "-"}
                    </td>
                  )}
                  {selectedColumns.includes("status") && (
                    <td className="px-4 py-2 border border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${
                          statusBadgeClasses[issue.status]
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                  )}
                  {selectedColumns.includes("action") && (
                    <td className="px-4 py-2 border border-gray-200">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute left-0 mt-2 w-full origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } w-full text-left px-3 py-2 text-sm text-gray-700`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } w-full text-left px-3 py-2 text-sm text-gray-700`}
                              >
                                Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "bg-gray-100" : ""
                                } w-full text-left px-3 py-2 text-sm text-red-600`}
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
    </div>
  );
};

export default IssuesPage;
