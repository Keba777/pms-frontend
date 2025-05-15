import React from "react";
import { Equipment } from "@/types/equipment";

interface EquipmentTableProps {
  equipment?: Equipment[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  counts?: Record<string, number>;
  onCountChange?: (id: string, count: number) => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment = [],
  selectedIds,
  onSelect,
  counts,
  onCountChange,
}) => {
  // sum of totalAmount for footer
  const totalAmountSum = equipment.reduce((sum, e) => {
    const amt = parseFloat(String(e.totalAmount)) || 0;
    return sum + amt;
  }, 0);

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2 text-center">Equipment</h3>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-cyan-700 text-white text-center">
          <tr>
            <th className="border px-3 py-2">Select</th>
            <th className="border px-3 py-2">No</th>
            <th className="border px-3 py-2">Equipment Name</th>
            <th className="border px-3 py-2">Type</th>
            <th className="border px-3 py-2">Unit</th>
            <th className="border px-3 py-2">Qty</th>
            <th className="border px-3 py-2">Min-Qty</th>
            <th className="border px-3 py-2">Rate</th>
            <th className="border px-3 py-2">OT</th>
            <th className="border px-3 py-2">Total Rate</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map((e, idx) => {
            const checked = selectedIds.includes(e.id);
            const currentCount = counts?.[e.id] ?? 1;
            return (
              <tr key={e.id} className="border-b">
                <td className="border px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(ev) => onSelect(e.id, ev.target.checked)}
                  />
                </td>
                <td className="border px-3 py-2 text-center">{idx + 1}</td>
                <td className="border px-3 py-2 text-center">{e.item}</td>
                <td className="border px-3 py-2 text-center">{e.type}</td>
                <td className="border px-3 py-2 text-center">{e.unit}</td>
                <td className="border px-3 py-2 text-center">
                  {onCountChange ? (
                    <input
                      type="number"
                      min={1}
                      value={currentCount}
                      onChange={(ev) =>
                        onCountChange(e.id, Math.max(1, +ev.target.value))
                      }
                      className="w-16 text-center border rounded"
                    />
                  ) : (
                    e.quantity ?? "-"
                  )}
                </td>
                <td className="border px-3 py-2 text-center">
                  {e.minQuantity ?? "0"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {e.rate ?? "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {e.reorderQuantity}
                </td>
                <td className="border px-3 py-2 text-center">
                  {e.totalAmount}
                </td>
              </tr>
            );
          })}
          {equipment.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="border px-3 py-4 text-center text-gray-500"
              >
                No equipment found.
              </td>
            </tr>
          )}
        </tbody>
        {equipment.length > 0 && (
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td colSpan={9} className="border px-3 py-2 text-right">
                Total
              </td>
              <td className="border px-3 py-2 text-center">
                {totalAmountSum.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default EquipmentTable;
