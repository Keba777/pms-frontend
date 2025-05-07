import { Material } from "@/types/material";

interface MaterialsTableProps {
  materials?: Material[];
  selectedIds: string[];
  counts: Record<string, number>;
  onSelect: (id: string, checked: boolean) => void;
  onCount: (id: string, count: number) => void;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials = [],
  selectedIds,
  counts,
  onSelect,
  onCount,
}) => {
  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-semibold mb-2">Materials</h3>
      <table className="min-w-full border border-gray-200">
        <thead className="bg-cyan-700 text-white">
          <tr>
            <th className="px-3 py-2">Select</th>
            <th className="px-3 py-2">No</th>
            <th className="px-3 py-2">Item</th>
            <th className="px-3 py-2">Unit</th>
            <th className="px-3 py-2">Qty</th>
            <th className="px-3 py-2">Rate</th>
            <th className="px-3 py-2">Required Qty</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, idx) => {
            const checked = selectedIds.includes(m.id);
            return (
              <tr key={m.id} className="border-b">
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onSelect(m.id, e.target.checked)}
                  />
                </td>
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{m.item}</td>
                <td className="px-3 py-2">{m.unit}</td>
                <td className="px-3 py-2">{m.minQuantity ?? "-"}</td>
                <td className="px-3 py-2">{m.rate ?? "-"}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={counts[m.id] ?? ""}
                    disabled={!checked}
                    onChange={(e) =>
                      onCount(m.id, parseInt(e.target.value, 10) || 0)
                    }
                    className="w-20 px-1 py-1 border rounded"
                  />
                </td>
              </tr>
            );
          })}
          {materials.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-gray-500">
                No materials found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsTable;
