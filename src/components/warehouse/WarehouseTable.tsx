"use client";

import React from "react";
import { Warehouse } from "@/types/warehouse";
import { Equipment } from "@/types/equipment";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

interface WarehouseTableProps {
  warehouses: Warehouse[] | undefined;
  equipments: Equipment[] | undefined;
  // Optionally, you can add handler props for edit, delete, quick view actions.
  // onEdit?: (warehouse: Warehouse) => void;
  // onDelete?: (warehouse: Warehouse) => void;
  // onQuickView?: (warehouse: Warehouse) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  equipments,
  // onEdit,
  // onDelete,
  // onQuickView,
}) => {
  // Create a lookup map for equipments by their id.
  const equipmentMap = new Map<string, Equipment>();
  equipments?.forEach((eqp) => {
    equipmentMap.set(eqp.id, eqp);
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-max divide-y divide-gray-200 shadow-lg rounded-lg">
        <thead className="bg-cyan-700">
          <tr>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              ID
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Equipment
            </th>
            {/* <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Manufacturer
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Year
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Condition
            </th> */}
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Type
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Owner
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Working Status
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Now is Working
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Joined Date
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Payment Rate
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Approved By
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Remark
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Status
            </th>
            <th className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {warehouses && warehouses.length > 0 ? (
            warehouses.map((warehouse, index) => {
              // Get matching equipment by equipment_id.
              const equipment = equipmentMap.get(warehouse.equipment_id);

              return (
                <tr key={warehouse.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {index + 1}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {equipment ? equipment.item : "N/A"}
                  </td>

                  {/* <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {equipment?.manufacturer ?? "N/A"}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {equipment?.year ?? "N/A"}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {equipment?.eqp_condition ?? "N/A"}
                  </td> */}

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.type}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.owner}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.workingStatus}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.currentWorkingSite}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {equipment?.createdAt
                      ? new Date(equipment.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {equipment && equipment.rate !== undefined
                      ? equipment.rate
                      : "N/A"}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.approvedBy ?? "N/A"}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.remark ?? "N/A"}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {warehouse.status}
                  </td>

                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <div className="relative inline-block">
                      <Menu>
                        <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                          Action <ChevronDown className="w-4 h-4" />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  // Wire up your update callback here:
                                  // onEdit && onEdit(warehouse);
                                  console.log("Update", warehouse.id);
                                }}
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  active ? "bg-blue-100" : ""
                                }`}
                              >
                                Update
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  // Wire up your delete callback here:
                                  // onDelete && onDelete(warehouse);
                                  console.log("Delete", warehouse.id);
                                }}
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  active ? "bg-blue-100" : ""
                                }`}
                              >
                                Delete
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  // Wire up your quick view callback here:
                                  // onQuickView && onQuickView(warehouse);
                                  console.log("Quick View", warehouse.id);
                                }}
                                className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                                  active ? "bg-blue-100" : ""
                                }`}
                              >
                                Quick View
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={15} className="px-4 py-2 text-center text-sm">
                No warehouses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseTable;
