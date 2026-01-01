"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import { useActivities } from "@/hooks/useActivities";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/common/ui/SearchInput";
import { Request } from "@/types/request";
import {
  FilterField,
  FilterValues,
  GenericFilter,
} from "@/components/common/GenericFilter";

const IncomingRequestsPage = () => {
  const {
    data: requests,
    isLoading: reqLoading,
    error: reqError,
  } = useRequests();
  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();
  const {
    data: departments,
    isLoading: deptLoading,
    error: deptError,
  } = useDepartments();
  const {
    data: activities,
    isLoading: actLoading,
    error: actError,
  } = useActivities();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // filtered list based on searchQuery (search by user name or status)
  const searchfilteredRequests = useMemo(
    () =>
      requests?.filter((r: Request) => {
        const userName = r.user?.first_name?.toLowerCase() || "";
        const status = r.status.toLowerCase();
        return (
          userName.includes(searchQuery.toLowerCase()) ||
          status.includes(searchQuery.toLowerCase())
        );
      }) ?? [],
    [searchQuery, requests]
  );

  // loading / error guards
  if (reqLoading || siteLoading || deptLoading || actLoading)
    return <div>Loading...</div>;
  if (reqError || siteError || deptError || actError)
    return <div className="text-red-500">Error loading data.</div>;

  // status summary values
  const total = requests?.length ?? 0;
  const pending = requests?.filter((r) => r.status === "Pending").length ?? 0;
  const inProgress =
    requests?.filter((r) => r.status === "In Progress").length ?? 0;
  const completed =
    requests?.filter((r) => r.status === "Completed").length ?? 0;
  const rejected = requests?.filter((r) => r.status === "Rejected").length ?? 0;

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
      accessor: (row: Request) =>
        departments?.find((d) => d.id === row.departmentId)?.name || "-",
    },
    {
      header: "Activity",
      accessor: (row: Request) =>
        activities?.find((a) => a.id === row.activityId)?.activity_name || "-",
    },
    {
      header: "Site",
      accessor: (row: Request) =>
        sites?.find((s) => s.id === row.siteId)?.name || "-",
    },
    {
      header: "Material Count",
      accessor: (row: Request) => row.materialCount ?? "-",
    },
    {
      header: "Labor Count",
      accessor: (row: Request) => row.laborCount ?? "-",
    },
    {
      header: "Equipment Count",
      accessor: (row: Request) => row.equipmentCount ?? "-",
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

  const filterFields: FilterField<string>[] = [
    {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "Pending", label: "Pending" },
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Rejected", label: "Rejected" },
      ],
    },
    {
      name: "site",
      type: "select",
      label: "Site",
      options:
        sites?.map((site) => ({
          value: site.id,
          label: site.name,
        })) || [],
    },
    {
      name: "department",
      type: "select",
      label: "Department",
      options:
        departments?.map((dept) => ({
          value: dept.id,
          label: dept.name,
        })) || [],
    },
  ];
  const filteredRequests = searchfilteredRequests?.filter((request) => {
    let matches = true;

    if (filterValues.status) {
      matches = matches && request.status === filterValues.status;
    }
    if (filterValues.site) {
      matches = matches && request.siteId === filterValues.site;
    }
    if (filterValues.department) {
      matches = matches && request.departmentId === filterValues.department;
    }

    return matches;
  });

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
          Incoming Requests
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/requests/create">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-cyan-700 rounded-lg hover:bg-cyan-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: total },
          { label: "Pending", value: pending },
          { label: "In Progress", value: inProgress },
          { label: "Completed", value: completed },
          { label: "Rejected", value: rejected },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center group hover:bg-gray-50 transition-all"
          >
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 group-hover:text-cyan-600 transition-colors">{item.label}</p>
            <span className="text-2xl font-black text-gray-800">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="w-full lg:w-72">
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <GenericDownloads
              data={filteredRequests.map((req, idx) => ({
                ...req,
                displayId: `RC${String(idx + 1).padStart(3, "0")}`,
              }))}
              title="All_Requests"
              columns={[
                { header: "Request ID", accessor: "displayId" },
                ...columns.slice(1),
              ]}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <p className="text-gray-600">No requests match your search.</p>
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
                  "Labor Count",
                  "Equipment Count",
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
                      {departments?.find((d) => d.id === req.departmentId)
                        ?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {activities?.find((a) => a.id === req.activityId)
                        ?.activity_name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {sites?.find((s) => s.id === req.siteId)?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.materialCount ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.laborCount ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {req.equipmentCount ?? "-"}
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
                                className={`${active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${active ? "bg-gray-100" : ""
                                  } w-full text-left px-3 py-2 text-sm text-gray-700`}
                              >
                                Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${active ? "bg-gray-100" : ""
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

export default IncomingRequestsPage;
