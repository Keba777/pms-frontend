"use client";

import React from "react";
import { useLabors } from "@/hooks/useLabors";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";
import { Site } from "@/types/site";

const ResourceLaborsPage: React.FC = () => {
  const { data: labors, isLoading, error } = useLabors();
  const { data: sites, isLoading: siteLoading } = useSites();

  if (isLoading || siteLoading) return <div>Loading labors...</div>;
  if (error) return <div>Error loading labors.</div>;

  const headers = [
    "ID",
    "Site Name",
    "Total Labor",
    "Allocated",
    "Unallocated",
    "On Leave",
    "Active",
    "Inactive",
    "Responsible Person",
  ];

  // Overall summary counts
  const totalAll = labors?.length ?? 0;
  const allocatedAll =
    labors?.filter((l) => l.allocationStatus === "Allocated").length ?? 0;
  const unallocatedAll =
    labors?.filter((l) => l.allocationStatus === "Unallocated").length ?? 0;
  const onLeaveAll =
    labors?.filter((l) => l.allocationStatus === "OnLeave").length ?? 0;
  const activeAll = labors?.filter((l) => l.status === "Active").length ?? 0;
  const inactiveAll =
    labors?.filter((l) => l.status === "InActive").length ?? 0;

  // Lookup helper
  const lookupSite = (siteId?: string) => sites?.find((s) => s.id === siteId);

  // Aggregate labors by site
  const aggregated: {
    [sid: string]: {
      site: Site;
      total: number;
      allocated: number;
      unallocated: number;
      onLeave: number;
      active: number;
      inactive: number;
      responsiblePerson: string;
    };
  } = {};

  labors?.forEach((lab) => {
    const site = lookupSite(lab.siteId);
    if (!site) return;
    const sid = site.id;

    if (!aggregated[sid]) {
      aggregated[sid] = {
        site,
        total: 0,
        allocated: 0,
        unallocated: 0,
        onLeave: 0,
        active: 0,
        inactive: 0,
        responsiblePerson: lab.responsiblePerson || "Unknown",
      };
    }

    aggregated[sid].total += 1;
    switch (lab.allocationStatus) {
      case "Allocated":
        aggregated[sid].allocated += 1;
        break;
      case "Unallocated":
        aggregated[sid].unallocated += 1;
        break;
      case "OnLeave":
        aggregated[sid].onLeave += 1;
        break;
      default:
        break;
    }

    if (lab.status === "Active") {
      aggregated[sid].active += 1;
    } else if (lab.status === "InActive") {
      aggregated[sid].inactive += 1;
    }
  });

  const rows = Object.values(aggregated).map((item, idx) => ({
    id: idx + 1,
    ...item,
  }));

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex justify-between mb-4 mt-4">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Home
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-semibold">Labors</li>
          </ol>
        </nav>
      </div>

      {/* Overall Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total Labor", value: totalAll },
          { label: "Allocated", value: allocatedAll },
          { label: "Unallocated", value: unallocatedAll },
          { label: "On Leave", value: onLeaveAll },
          { label: "Active", value: activeAll },
          { label: "Inactive", value: inactiveAll },
        ].map((item) => (
          <div
            key={item.label}
            className="flex font-2xl font-semibold bg-white p-4 rounded-lg shadow-md"
          >
            <h2 className="mr-2">{item.label} =</h2>
            <div className="flex items-center">
              <span className="text-cyan-700 font-stretch-semi-condensed font-semibold">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Aggregated Labor Table */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2 border border-gray-200">{row.id}</td>
                  <td className="px-4 py-2 border border-gray-200">
                    <Link
                      href={`/resources/labors/${row.site.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.site.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.total}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.allocated}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.unallocated}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.onLeave}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.active}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.inactive}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.responsiblePerson}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-2 text-center border border-gray-200"
                >
                  No labor records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceLaborsPage;
