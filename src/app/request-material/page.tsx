"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/common/ui/SearchInput";
import { Request } from "@/types/request";

const MaterialRequests = () => {
  const {
    data: requests,
    isLoading: reqLoading,
    error: reqError,
  } = useRequests();

  const [searchQuery, setSearchQuery] = useState("");

  // filtered list based on searchQuery (search by user name or status) and material requests only
  const filteredRequests = useMemo(
    () =>
      requests?.filter((r: Request) => {
        const userName = r.user?.first_name?.toLowerCase() || "";
        const status = r.status.toLowerCase();
        return (
          (userName.includes(searchQuery.toLowerCase()) ||
            status.includes(searchQuery.toLowerCase())) &&
          (r.materialCount ?? 0) > 0
        );
      }) ?? [],
    [searchQuery, requests]
  );

  // loading / error guards
  if (reqLoading) return <div>Loading...</div>;
  if (reqError) return <div className="text-red-500">Error loading data.</div>;

  // status summary values
  const total = filteredRequests?.length ?? 0;
  const pending =
    filteredRequests?.filter((r) => r.status === "Pending").length ?? 0;
  const inProgress =
    filteredRequests?.filter((r) => r.status === "In Progress").length ?? 0;
  const completed =
    filteredRequests?.filter((r) => r.status === "Completed").length ?? 0;
  const rejected =
    filteredRequests?.filter((r) => r.status === "Rejected").length ?? 0;

  // define download columns
  const columns: Column<Request & { displayId: string }>[] = [
    {
      header: "Request ID",
      accessor: "displayId",
    },
    {
      header: "User",
      accessor: (row: Request) => row.user?.first_name || "-",
    },
    {
      header: "Department",
      accessor: (row: Request) => row.department?.name || "-",
    },
    {
      header: "Activity",
      accessor: (row: Request) => row.activity?.activity_name || "-",
    },
    {
      header: "Site",
      accessor: (row: Request) => row.site?.name || "-",
    },
    {
      header: "Material Count",
      accessor: (row: Request) => row.materialCount ?? "-",
    },
    { header: "Status", accessor: (row: Request) => row.status },
    {
      header: "Created At",
      accessor: (row: Request) =>
        new Date(row.createdAt).toISOString().split("T")[0],
    },
    {
      header: "Updated At",
      accessor: (row: Request) =>
        new Date(row.updatedAt).toISOString().split("T")[0],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Top Actions */}
      <div className="flex justify-between items-center mb-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <div className="flex gap-4">
          <GenericDownloads
            data={filteredRequests.map((req, idx) => ({
              ...req,
              displayId: `RC${String(idx + 1).padStart(3, "0")}`,
            }))}
            title="Material_Requests"
            columns={[
              { header: "Request ID", accessor: "displayId" },
              ...columns.slice(1),
            ]}
          />
        </div>
      </div>

      <h1 className="text-4xl font-bold text-cyan-800 mb-4">
        Material Requests
      </h1>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total", value: total },
          { label: "Pending", value: pending },
          { label: "In Progress", value: inProgress },
          { label: "Completed", value: completed },
          { label: "Rejected", value: rejected },
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

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <p className="text-gray-600">No material requests match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-cyan-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase">
                  #
                </th>
                {[
                  "Request ID",
                  "User",
                  "Department",
                  "Activity",
                  "Site",
                  "Material Count",
                  "Status",
                  "Created Date",
                  "Updated Date",
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
              {filteredRequests.map((req, idx) => {
                const displayId = `RC${String(idx + 1).padStart(3, "0")}`;
                return (
                  <tr key={req.id}>
                    <td className="px-4 py-2 border border-gray-200">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      <Link
                        href={`/requests/${req.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {displayId}
                      </Link>
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.user?.first_name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.department?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.activity?.activity_name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.site?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.materialCount ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.status}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaterialRequests;
