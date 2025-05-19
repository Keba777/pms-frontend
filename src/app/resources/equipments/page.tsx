"use client";

import React from "react";
import { useEquipments } from "@/hooks/useEquipments";
import { useSites } from "@/hooks/useSites";
import Link from "next/link";

const ResourceEquipmentsPage: React.FC = () => {
  const { data: equipments, isLoading, error } = useEquipments();
  const { data: sites, isLoading: siteLoading } = useSites();

  if (isLoading || siteLoading) return <div>Loading equipment...</div>;
  if (error) return <div>Error loading equipment.</div>;

  const headers = [
    "ID",
    "Site Name",
    "Total Equipment",
    "Allocated",
    "Unallocated",
    "On Maintainance",
    "Inactive",
  ];

  // Helper lookup
  const lookupSite = (siteId?: string) => sites?.find((s) => s.id === siteId);

  // Overall summary counts
  const totalAll = equipments?.length ?? 0;
  const allocatedAll =
    equipments?.filter((e) => e.status === "Allocated").length ?? 0;
  const unallocatedAll =
    equipments?.filter((e) => e.status === "Unallocated").length ?? 0;
  const onMaintainanceAll =
    equipments?.filter((e) => e.status === "OnMaintainance").length ?? 0;
  const inactiveAll =
    equipments?.filter((e) => e.status === "InActive").length ?? 0;
  const rentalAll = equipments?.filter((e) => e.owner === "Rental").length ?? 0;
  const ownAll = equipments?.filter((e) => e.owner === "Raycon").length ?? 0;

  // Aggregate equipments by site
  const aggregated: Record<
    string,
    {
      site: { id: string; name: string };
      total: number;
      allocated: number;
      unallocated: number;
      onMaintainance: number;
      inactive: number;
    }
  > = {};

  equipments?.forEach((eqp) => {
    const site = lookupSite(eqp.siteId);
    if (!site) return;
    const sid = site.id;

    if (!aggregated[sid]) {
      aggregated[sid] = {
        site,
        total: 0,
        allocated: 0,
        unallocated: 0,
        onMaintainance: 0,
        inactive: 0,
      };
    }

    aggregated[sid].total += 1;

    switch (eqp.status) {
      case "Allocated":
        aggregated[sid].allocated += 1;
        break;
      case "Unallocated":
        aggregated[sid].unallocated += 1;
        break;
      case "OnMaintainance":
        aggregated[sid].onMaintainance += 1;
        break;
      case "InActive":
        aggregated[sid].inactive += 1;
        break;
      default:
        break;
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
            <li className="text-gray-900 font-semibold">Equipments</li>
          </ol>
        </nav>
      </div>

      {/* Overall Summary Cards */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { label: "Total", value: totalAll },
          { label: "Allocated", value: allocatedAll },
          { label: "Unallocated", value: unallocatedAll },
          { label: "On Maintainance", value: onMaintainanceAll },
          { label: "Inactive", value: inactiveAll },
          { label: "Rental", value: rentalAll },
          { label: "Own", value: ownAll },
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

      {/* Aggregated Equipment Table */}
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
                      href={`/resources/equipments/${row.site.id}`}
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
                    {row.onMaintainance}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.inactive}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-2 text-center border border-gray-200"
                >
                  No equipment records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceEquipmentsPage;
