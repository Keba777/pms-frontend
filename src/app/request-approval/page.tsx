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
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
          Approvals
        </h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:w-72">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by Ref No or Department" />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <GenericDownloads
              data={filteredApprovals}
              title={`Approvals_${new Date().toISOString().split("T")[0]}`}
              columns={columns}
            />
          </div>
        </div>
      </div>

      {filteredApprovals.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No approvals match your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
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
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredApprovals.map((app, idx) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{idx + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/requests/${app.requestId}`} className="text-blue-600 hover:underline font-bold text-sm">
                      {`RC${app.requestId.slice(0, 4).toUpperCase()}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-bold">{app.stepOrder}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-bold">{app.department?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                      app.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 italic whitespace-nowrap">{app.checkedByUser?.first_name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 italic whitespace-nowrap">{app.approvedByUser?.first_name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 min-w-[200px]">{app.remarks || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 italic whitespace-nowrap">{app.prevDepartment?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 italic whitespace-nowrap">{app.nextDepartment?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${app.finalDepartment ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                      {app.finalDepartment ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Menu as="div" className="relative inline-block text-left">
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-xs font-black uppercase bg-cyan-700 text-white rounded hover:bg-cyan-800 transition-colors shadow-sm">
                        Action <ChevronDown className="w-3 h-3" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-36 origin-top-right bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-50 py-1">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`${active ? "bg-gray-50" : ""} w-full text-left px-4 py-2 text-xs font-bold text-gray-700`}
                              onClick={() => console.log(`View approval ${app.id}`)}
                            >
                              View
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`${active ? "bg-gray-50" : ""} w-full text-left px-4 py-2 text-xs font-bold text-gray-700`}
                              onClick={() => console.log(`Edit approval ${app.id}`)}
                            >
                              Edit
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <button
                              className={`${active ? "bg-gray-50" : ""} w-full text-left px-4 py-2 text-xs font-bold text-red-600`}
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
    </div>
  );
};

export default ApprovalsPage;