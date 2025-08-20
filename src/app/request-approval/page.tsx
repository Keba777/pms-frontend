"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useApprovals } from "@/hooks/useApprovals";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/common/ui/SearchInput";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Approval } from "@/types/approval";

const ApprovalsPage = () => {
  const {
    data: approvals,
    isLoading: appLoading,
    error: appError,
  } = useApprovals();
  const { data: departments, isLoading: deptLoading, error: deptError } = useDepartments();
  const { data: users, isLoading: userLoading, error: userError } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");

  // Enrich approvals with lookup data
  const enrichedApprovals = useMemo(() => {
    if (!approvals || !departments || !users) return [];
    return approvals.map((a) => {
      const dept = departments.find((d) => d.id === a.departmentId) || undefined;
      const approvedBy = users.find((u) => u.id === a.approvedByUser?.id) || undefined;
      const checkedBy = users.find((u) => u.id === a.checkedByUser?.id) || undefined;
      const prevDept = departments.find((d) => d.id === a.prevDepartment?.id) || undefined;
      const nextDept = departments.find((d) => d.id === a.nextDepartment?.id) || undefined;
      return {
        ...a,
        department: dept,
        approvedByUser: approvedBy,
        checkedByUser: checkedBy,
        prevDepartment: prevDept,
        nextDepartment: nextDept,
      };
    });
  }, [approvals, departments, users]);

  // Filter based on search (match on Request Ref No or Department name)
  const filteredApprovals = useMemo(() => {
    return enrichedApprovals.filter((a) => {
      const refNo = `RC${a.requestId.slice(0, 4).toUpperCase()}`;
      const deptName = a.department?.name || "";
      return (
        refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deptName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery, enrichedApprovals]);

  // Define columns for CSV/Excel download
  const columns: Column<Approval>[] = [
    {
      header: "Request Ref",
      accessor: (row: Approval) => `RC${row.requestId.slice(0, 4).toUpperCase()}`,
    },
    { header: "Step Order", accessor: (row: Approval) => row.stepOrder },
    {
      header: "Department",
      accessor: (row: Approval) => row.department?.name || "-",
    },
    { header: "Status", accessor: (row: Approval) => row.status },
    {
      header: "Checked By",
      accessor: (row: Approval) => row.checkedByUser?.first_name || "-",
    },
    {
      header: "Approved By",
      accessor: (row: Approval) => row.approvedByUser?.first_name || "-",
    },
    {
      header: "Approved At",
      accessor: (row: Approval) =>
        row.approvedAt ? new Date(row.approvedAt).toISOString().split("T")[0] : "-",
    },
    { header: "Remarks", accessor: (row: Approval) => row.remarks || "-" },
    {
      header: "Prev Dept",
      accessor: (row: Approval) => row.prevDepartment?.name || "-",
    },
    {
      header: "Next Dept",
      accessor: (row: Approval) => row.nextDepartment?.name || "-",
    },
    {
      header: "Final Dept",
      accessor: (row: Approval) => (row.finalDepartment ? "Yes" : "No"),
    },
  ];

  const isLoading = appLoading || deptLoading || userLoading;
  const hasError = appError || deptError || userError;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {isLoading ? (
        <div>Loading...</div>
      ) : hasError ? (
        <div className="text-red-500">Error loading data.</div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by Ref No or Department" />
            <GenericDownloads
              data={filteredApprovals}
              title={`Approvals_${new Date().toISOString().split("T")[0]}`}
              columns={columns}
            />
          </div>

          <h1 className="text-4xl font-bold text-blue-700 mb-4">Approvals</h1>

          {/* Approvals Table */}
          {filteredApprovals.length === 0 ? (
            <p className="text-gray-600">No approvals match your search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-blue-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase">#</th>
                    {[
                      "Request Ref",
                      "Step Order",
                      "Department",
                      "Status",
                      "Checked By",
                      "Approved By",
                      "Approved At",
                      "Remarks",
                      "Prev Dept",
                      "Next Dept",
                      "Final Dept",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left text-xs font-medium text-white uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApprovals.map((app, idx) => (
                    <tr key={app.id}>
                      <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                      <td className="px-4 py-2 border border-gray-200">
                        <Link href={`/requests/${app.requestId}`} className="text-blue-600 hover:underline">
                          {`RC${app.requestId.slice(0, 4).toUpperCase()}`}
                        </Link>
                      </td>
                      <td className="px-4 py-2 border border-gray-200">{app.stepOrder}</td>
                      <td className="px-4 py-2 border border-gray-200">{app.department?.name || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200">{app.status}</td>
                      <td className="px-4 py-2 border border-gray-200">{app.checkedByUser?.first_name || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200">{app.approvedByUser?.first_name || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200">
                        {app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200">{app.remarks || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200">{app.prevDepartment?.name || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200">{app.nextDepartment?.name || "-"}</td>
                      <td className="px-4 py-2 border border-gray-200">
                        {app.finalDepartment ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2 border border-gray-200">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Action <ChevronDown className="w-4 h-4" />
                          </MenuButton>
                          <MenuItems className="absolute left-0 mt-2 w-36 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`${active ? "bg-gray-100" : ""} w-full text-left px-3 py-2 text-sm text-gray-700`}
                                  onClick={() => console.log(`View approval ${app.id}`)}
                                >
                                  View
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`${active ? "bg-gray-100" : ""} w-full text-left px-3 py-2 text-sm text-gray-700`}
                                  onClick={() => console.log(`Edit approval ${app.id}`)}
                                >
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={`${active ? "bg-gray-100" : ""} w-full text-left px-3 py-2 text-sm text-red-600`}
                                  onClick={() => console.log(`Delete approval ${app.id}`)}
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
        </>
      )}
    </div>
  );
};

export default ApprovalsPage;