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
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="min-w-max divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "Type", "Owner", "Working Status", "Status", "Actions"].map((head) => (
                <th key={head} className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No warehouses found.</p>
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
    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
      <table className="min-w-max divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</th>
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Working Status</th>
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Site</th>
            {showApprovedBy && (
              <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Approved By</th>
            )}
            {showRemark && (
              <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Remark</th>
            )}
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
            <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {warehouses.map((warehouse, index) => (
            <tr key={warehouse.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-4 text-sm font-black text-gray-400">
                {String(index + 1).padStart(2, '0')}
              </td>
              <td className="px-5 py-4 text-sm font-bold text-gray-700">
                {warehouse.type}
              </td>
              <td className="px-5 py-4 text-sm font-medium text-gray-600">
                {warehouse.owner}
              </td>
              <td className="px-5 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${warehouse.workingStatus === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {warehouse.workingStatus}
                </span>
              </td>
              <td className="px-5 py-4 text-sm font-bold text-cyan-700">
                {warehouse?.site.name ?? "-"}
              </td>
              {showApprovedBy && (
                <td className="px-5 py-4 text-sm text-gray-500 italic">
                  {warehouse.approvedBy ?? "-"}
                </td>
              )}
              {showRemark && (
                <td className="px-5 py-4 text-sm text-gray-500 max-w-xs truncate italic">
                  {warehouse.remark ?? "-"}
                </td>
              )}
              <td className="px-5 py-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${warehouse.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                  {warehouse.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <Menu as="div" className="relative inline-block text-left">
                  <MenuButton className="flex items-center gap-1 px-4 py-1.5 text-[10px] font-black uppercase bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition-all shadow-sm">
                    Action <ChevronDown className="w-3 h-3" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 divide-y divide-gray-50 rounded-xl shadow-xl focus:outline-none z-[9999] py-1 backdrop-blur-sm bg-white/95">
                    {[
                      { label: "Edit Record", action: () => onEdit && onEdit(warehouse) },
                      { label: "Quick View", action: () => onQuickView && onQuickView(warehouse) },
                      { label: "Delete", action: () => onDelete && onDelete(warehouse), color: "text-rose-600" }
                    ].map((item) => (
                      <MenuItem key={item.label}>
                        {({ active }) => (
                          <button
                            className={`block w-full px-4 py-2 text-left text-xs font-bold ${item.color || 'text-gray-700'} ${active ? "bg-gray-50 text-cyan-700" : ""
                              }`}
                            onClick={item.action}
                          >
                            {item.label}
                          </button>
                        )}
                      </MenuItem>
                    ))}
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
