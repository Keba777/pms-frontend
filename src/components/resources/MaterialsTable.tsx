// components/resources/MaterialsTable.tsx
import React from "react";
import { Material } from "@/types/material";

interface MaterialsTableProps {
  materials?: Material[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  counts?: Record<string, number>;
  onCountChange?: (id: string, count: number) => void;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials = [],
  selectedIds,
  onSelect,
  counts,
  onCountChange,
}) => {
  const totalCost = materials.reduce((sum, m) => {
    const price = parseFloat(String(m.totalPrice)) || 0;
    return sum + price;
  }, 0);

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">Materials</h3>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-cyan-700 text-white">
          <tr>
            <th className="border px-3 py-2">Select</th>
            <th className="border px-3 py-2">No</th>
            <th className="border px-3 py-2">Item Name</th>
            <th className="border px-3 py-2">Type</th>
            <th className="border px-3 py-2">Unit</th>
            <th className="border px-3 py-2">Qty</th>
            <th className="border px-3 py-2">Min-Qty</th>
            <th className="border px-3 py-2">Rate</th>
            <th className="border px-3 py-2">Total</th>
            <th className="border px-3 py-2">Shelf No</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {materials.length > 0 ? (
            materials.map((m, idx) => {
              const checked = selectedIds.includes(m.id);
              const currentCount = counts?.[m.id] ?? 1;
              return (
                <tr key={m.id} className="border-b">
                  <td className="border px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => onSelect(m.id, e.target.checked)}
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.item}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.type}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.unit}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {onCountChange ? (
                      <input
                        type="number"
                        min={1}
                        value={currentCount}
                        onChange={(e) =>
                          onCountChange(m.id, Math.max(1, +e.target.value))
                        }
                        className="w-16 text-center border rounded"
                      />
                    ) : (
                      m.quantity ?? 0
                    )}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.minQuantity ?? 0}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.rate ?? "-"}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.totalPrice}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.shelfNo}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {m.status}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={11}
                className="border px-3 py-4 text-center text-gray-500"
              >
                No materials found.
              </td>
            </tr>
          )}
        </tbody>
        {materials.length > 0 && (
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td colSpan={8} className="border px-3 py-2 text-right">
                Total Cost
              </td>
              <td className="border px-3 py-2 text-center">
                {totalCost.toFixed(2)}
              </td>
              <td colSpan={2} className="border px-3 py-2"></td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default MaterialsTable;
