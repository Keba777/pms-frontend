"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useIssues } from "@/hooks/useIssues";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/ui/SearchInput";
import { Issue } from "@/types/issue";

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

  const [searchQuery, setSearchQuery] = useState("");

  // Compute filteredIssues using useMemo, with a fallback for when issues is undefined
  const filteredIssues = useMemo(() => {
    if (!issues) return [];
    return issues.filter((i: Issue) => {
      const issueType = i.issueType.toLowerCase();
      const raisedByName = i.raisedBy?.first_name?.toLowerCase() || "";
      return (
        issueType.includes(searchQuery.toLowerCase()) ||
        raisedByName.includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, issues]);

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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Top Actions */}
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-4">
          <GenericDownloads
            data={filteredIssues}
            title="Issues_List"
            columns={columns}
          />

          <button
            type="button"
            className="px-3 py-3 text-white bg-cyan-700 rounded hover:bg-cyan-800"
            title="New Issue"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Issues</h1>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-4">
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

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <p className="text-gray-600">No issues match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                {[
                  "Date",
                  "Issue Type",
                  "Description",
                  "Raised By",
                  "Priority",
                  "Site",
                  "Department",
                  "Responsible",
                  "Action Taken",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map((issue, idx) => (
                <tr key={issue.id}>
                  <td className="px-4 py-2 border border-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.date
                      ? new Date(issue.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.issueType}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.description}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.raisedBy?.first_name || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.priority || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {sites?.find((s) => s.id === issue.siteId)?.name || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {departments?.find((d) => d.id === issue.departmentId)
                      ?.name || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.responsible?.first_name || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.actionTaken || "-"}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {issue.status}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Menu as="div" className="relative inline-block text-left">
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
