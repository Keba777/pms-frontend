"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import Link from "next/link";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import SearchInput from "@/components/common/ui/SearchInput";
import { Request } from "@/types/request";
import { useSites } from "@/hooks/useSites";
import { useDepartments } from "@/hooks/useDepartments";
import {
  FilterField,
  FilterValues,
  GenericFilter,
} from "@/components/common/GenericFilter";

const LaborRequest = () => {
  const {
    data: requests,
    isLoading: reqLoading,
    error: reqError,
  } = useRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const searchFilteredRequests = useMemo(
    () =>
      requests?.filter((r: Request) => {
        const userName = r.user?.first_name?.toLowerCase() || "";
        const status = r.status.toLowerCase();
        return (
          (userName.includes(searchQuery.toLowerCase()) ||
            status.includes(searchQuery.toLowerCase())) &&
          (r.laborCount ?? 0) > 0
        );
      }) ?? [],
    [searchQuery, requests]
  );

  const { data: sites, isLoading: siteLoading, error: siteError } = useSites();
  const {
    data: departments,
    isLoading: deptLoading,
    error: deptError,
  } = useDepartments();

  // loading / error guards
  if (reqLoading || siteLoading || deptLoading)
    return <div className="p-10 text-center text-primary font-bold">Loading...</div>;
  if (reqError || siteError || deptError)
    return <div className="text-destructive font-bold p-10 text-center">Error loading data.</div>;

  const total = searchFilteredRequests?.length ?? 0;
  const pending =
    searchFilteredRequests?.filter((r) => r.status === "Pending").length ?? 0;
  const inProgress =
    searchFilteredRequests?.filter((r) => r.status === "In Progress").length ??
    0;
  const completed =
    searchFilteredRequests?.filter((r) => r.status === "Completed").length ?? 0;
  const rejected =
    searchFilteredRequests?.filter((r) => r.status === "Rejected").length ?? 0;

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
      header: "Labor Count",
      accessor: (row: Request) => row.laborCount ?? "-",
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

  const filteredRequests = searchFilteredRequests?.filter((request) => {
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
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border">
        <h1 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tight">
          Labor Requests
        </h1>
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
            className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center items-center text-center group hover:bg-accent transition-all"
          >
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">{item.label}</p>
            <span className="text-2xl font-black text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-card p-4 rounded-xl shadow-sm border border-border mb-8 flex flex-col gap-6">
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
              title="Labor_Requests"
              columns={[
                { header: "Request ID", accessor: "displayId" },
                ...columns.slice(1),
              ]}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <p className="text-muted-foreground">No Labor requests match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border border border-border">
            <thead className="bg-primary">
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
                  "Labor Count",
                  "Status",
                  "Created Date",
                  "Updated Date",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-primary-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredRequests.map((req, idx) => {
                const displayId = `RC${String(idx + 1).padStart(3, "0")}`;
                return (
                  <tr key={req.id}>
                    <td className="px-4 py-2 border border-border">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      <Link
                        href={`/requests/${req.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {displayId}
                      </Link>
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {req.user?.first_name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {req.department?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {req.activity?.activity_name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {req.site?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {req.laborCount ?? "-"}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {req.status}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      {new Date(req.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border border-border">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right bg-card border border-border divide-y divide-border rounded-md shadow-lg focus:outline-none z-50">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${active ? "bg-accent" : ""
                                  } w-full text-left px-3 py-2 text-sm text-foreground transition-colors`}
                              >
                                View
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${active ? "bg-accent" : ""
                                  } w-full text-left px-3 py-2 text-sm text-foreground transition-colors`}
                              >
                                Edit
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={`${active ? "bg-accent" : ""
                                  } w-full text-left px-3 py-2 text-sm text-destructive transition-colors`}
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

export default LaborRequest;
