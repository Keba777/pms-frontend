import React from "react";
import { Warehouse } from "@/types/warehouse";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

interface WarehouseTableProps {
  warehouses: Warehouse[] | undefined;
  onEdit?: (warehouse: Warehouse) => void;
  onDelete?: (warehouse: Warehouse) => void;
  onQuickView?: (warehouse: Warehouse) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  onEdit,
  onDelete,
  onQuickView,
}) => {
  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200 shadow-lg rounded-lg">
          <thead className="bg-cyan-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Working Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Current Site
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td colSpan={7} className="px-4 py-2 text-center text-sm">
                No warehouses found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const showApprovedBy = warehouses.some((w) => w.approvedBy);
  const showRemark = warehouses.some((w) => w.remark);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-max divide-y divide-gray-200 shadow-lg rounded-lg">
        <thead className="bg-cyan-700">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              ID
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Type
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Working Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Current Site
            </th>
            {showApprovedBy && (
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Approved By
              </th>
            )}
            {showRemark && (
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Remark
              </th>
            )}
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {warehouses.map((warehouse, index) => (
            <tr key={warehouse.id} className="hover:bg-gray-50">
              {/* Display sequential index instead of backend ID */}
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                {index + 1}
              </td>
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                {warehouse.type}
              </td>
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                {warehouse.owner}
              </td>
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                {warehouse.workingStatus}
              </td>
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                {warehouse.currentWorkingSite}
              </td>
              {showApprovedBy && (
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  {warehouse.approvedBy ?? "-"}
                </td>
              )}
              {showRemark && (
                <td className="px-4 py-2 text-sm whitespace-nowrap">
                  {warehouse.remark ?? "-"}
                </td>
              )}
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                {warehouse.status}
              </td>
              <td className="px-4 py-2 text-sm whitespace-nowrap">
                <Menu>
                  <MenuButton className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800">
                    Action <ChevronDown className="w-4 h-4" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                            active ? "bg-blue-100" : ""
                          }`}
                          onClick={() => onEdit && onEdit(warehouse)}
                        >
                          Edit
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                            active ? "bg-blue-100" : ""
                          }`}
                          onClick={() => onDelete && onDelete(warehouse)}
                        >
                          Delete
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          className={`block w-full px-4 py-2 text-left whitespace-nowrap ${
                            active ? "bg-blue-100" : ""
                          }`}
                          onClick={() => onQuickView && onQuickView(warehouse)}
                        >
                          Quick View
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
  );
};

export default WarehouseTable;
