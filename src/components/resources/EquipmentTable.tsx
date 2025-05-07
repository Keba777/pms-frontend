import { Equipment } from "@/types/equipment";

interface EquipmentTableProps {
  equipment?: Equipment[];
  selectedIds: string[];
  counts: Record<string, number>;
  onSelect: (id: string, checked: boolean) => void;
  onCount: (id: string, count: number) => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment = [],
  selectedIds,
  counts,
  onSelect,
  onCount,
}) => (
  <div className="overflow-x-auto">
    <h3 className="text-lg font-semibold mb-2">Equipment</h3>
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
        {equipment.map((e, idx) => {
          const checked = selectedIds.includes(e.id);
          return (
            <tr key={e.id} className="border-b">
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(ev) => onSelect(e.id, ev.target.checked)}
                />
              </td>
              <td className="px-3 py-2">{idx + 1}</td>
              <td className="px-3 py-2">{e.item}</td>
              <td className="px-3 py-2">{e.unit}</td>
              <td className="px-3 py-2">{e.minQuantity ?? "-"}</td>
              <td className="px-3 py-2">{e.rate ?? "-"}</td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={counts[e.id] ?? ""}
                  disabled={!checked}
                  onChange={(ev) =>
                    onCount(e.id, parseInt(ev.target.value, 10) || 0)
                  }
                  className="w-20 px-1 py-1 border rounded"
                />
              </td>
            </tr>
          );
        })}
        {equipment.length === 0 && (
          <tr>
            <td colSpan={7} className="py-4 text-center text-gray-500">
              No equipment found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default EquipmentTable;
