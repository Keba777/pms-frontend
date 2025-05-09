"use client";

import React from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

const sampleData = [
  {
    id: 1,
    activities: "Excavation",
    unit: "m³",
    qty: "",
    start: "",
    end: "",
    duration: "",
    progress: 80,
    status: "Not Started",
    resourceCosts: { labor: 0, material: 0, equipment: 0, total: 0 },
    overUnder: "0",
  },
  {
    id: 2,
    activities: "Concrete Pouring",
    unit: "m³",
    qty: 50,
    start: "",
    end: "",
    duration: "",
    progress: 60,
    status: "In Progress",
    resourceCosts: { labor: 600, material: 800, equipment: 300, total: 1700 },
    overUnder: "$300",
  },
  {
    id: 3,
    activities: "Rebar Installation",
    unit: "kg",
    qty: 1000,
    start: "",
    end: "",
    duration: "",
    progress: 45,
    status: "In Progress",
    resourceCosts: { labor: 400, material: 300, equipment: 100, total: 800 },
    overUnder: "$100",
  },
  {
    id: 4,
    activities: "Formwork",
    unit: "m²",
    qty: 150,
    start: "",
    end: "",
    duration: "",
    progress: 20,
    status: "Not Started",
    resourceCosts: { labor: 500, material: 300, equipment: 100, total: 900 },
    overUnder: "$200",
  },
  {
    id: 5,
    activities: "Backfilling",
    unit: "m³",
    qty: 120,
    start: "",
    end: "",
    duration: "",
    progress: 70,
    status: "In Progress",
    resourceCosts: { labor: 300, material: 250, equipment: 100, total: 650 },
    overUnder: "$150",
  },
  {
    id: 6,
    activities: "Waterproofing",
    unit: "m²",
    qty: 200,
    start: "",
    end: "",
    duration: "",
    progress: 50,
    status: "In Progress",
    resourceCosts: { labor: 500, material: 500, equipment: 200, total: 1200 },
    overUnder: "$200",
  },
  {
    id: 7,
    activities: "Painting",
    unit: "m²",
    qty: 300,
    start: "",
    end: "",
    duration: "",
    progress: 90,
    status: "Completed",
    resourceCosts: { labor: 300, material: 400, equipment: 100, total: 800 },
    overUnder: "$200",
  },
  {
    id: 8,
    activities: "Tiling",
    unit: "m²",
    qty: 100,
    start: "",
    end: "",
    duration: "",
    progress: 65,
    status: "In Progress",
    resourceCosts: { labor: 400, material: 350, equipment: 100, total: 850 },
    overUnder: "$100",
  },
  {
    id: 9,
    activities: "Plumbing",
    unit: "pts",
    qty: 30,
    start: "",
    end: "",
    duration: "",
    progress: 75,
    status: "In Progress",
    resourceCosts: { labor: 600, material: 400, equipment: 150, total: 1150 },
    overUnder: "$150",
  },
  {
    id: 10,
    activities: "Electrical Wiring",
    unit: "pts",
    qty: 40,
    start: "",
    end: "",
    duration: "",
    progress: 55,
    status: "In Progress",
    resourceCosts: { labor: 700, material: 600, equipment: 200, total: 1500 },
    overUnder: "$100",
  },
];

const ActualActivityTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-max border-collapse border border-gray-300">
        <thead className="bg-cyan-700 text-gray-50">
          <tr>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              ID
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Activities
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Unit
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Qty
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Start Date
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              End Date
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Duration
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Progress
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Status
            </th>
            <th
              colSpan={4}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-center whitespace-nowrap"
            >
              Resource Costs
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Over/Under
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-4 py-3 text-sm font-medium text-left whitespace-nowrap"
            >
              Actions
            </th>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
              Labor
            </th>
            <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
              Material
            </th>
            <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
              Equipment
            </th>
            <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-center whitespace-nowrap">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {sampleData.length > 0 ? (
            sampleData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.id}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.activities}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.unit}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.qty}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.start}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.end}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.duration}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  <div className="relative h-5 bg-gray-200 rounded">
                    <div
                      className="absolute h-full bg-blue-600 rounded"
                      style={{ width: `${row.progress}%` }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                        {row.progress}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.status}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                  {row.resourceCosts.labor}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                  {row.resourceCosts.material}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                  {row.resourceCosts.equipment}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm text-center">
                  {row.resourceCosts.total}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  {row.overUnder}
                </td>
                <td className="border border-gray-300 px-4 py-2 whitespace-nowrap text-sm">
                  <div className="relative inline-block">
                    <Menu>
                      <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                        Action <ChevronDown className="w-4 h-4" />
                      </MenuButton>
                      <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() => console.log("Update row", row.id)}
                            >
                              Update
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() => console.log("Delete row", row.id)}
                            >
                              Delete
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() =>
                                console.log("Quick View row", row.id)
                              }
                            >
                              Quick View
                            </button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ focus }) => (
                            <button
                              className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                focus ? "bg-blue-100" : ""
                              }`}
                              onClick={() => {
                                console.log("Manage clicked");
                              }}
                            >
                              Manage
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={14}
                className="border border-gray-300 px-4 py-2 text-center text-sm"
              >
                No activities found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActualActivityTable;
