import { Labor } from "@/types/labor";

interface LaborTableProps {
  labor?: Labor[];
  selectedIds: string[];
  counts: Record<string, number>;
  onSelect: (id: string, checked: boolean) => void;
  onCount: (id: string, count: number) => void;
}

const LaborTable: React.FC<LaborTableProps> = ({
  labor = [],
  selectedIds,
  counts,
  onSelect,
  onCount,
}) => (
  <div className="overflow-x-auto">
    <h3 className="text-lg font-semibold mb-2">Labor</h3>
    <table className="min-w-full border border-gray-200">
      <thead className="bg-cyan-700 text-white">
        <tr>
          <th className="px-3 py-2">Select</th>
          <th className="px-3 py-2">No</th>
          <th className="px-3 py-2">Role</th>
          <th className="px-3 py-2">Unit</th>
          <th className="px-3 py-2">Skill</th>
          <th className="px-3 py-2">Min Qty</th>
          <th className="px-3 py-2">Rate</th>
          <th className="px-3 py-2">Required Qty</th>
        </tr>
      </thead>
      <tbody>
        {labor.map((l, idx) => {
          const checked = selectedIds.includes(l.id);
          return (
            <tr key={l.id} className="border-b">
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(ev) => onSelect(l.id, ev.target.checked)}
                />
              </td>
              <td className="px-3 py-2">{idx + 1}</td>
              <td className="px-3 py-2">{l.role}</td>
              <td className="px-3 py-2">{l.unit}</td>
              <td className="px-3 py-2">{l.skill_level ?? "-"}</td>
              <td className="px-3 py-2">{l.minQuantity ?? "-"}</td>
              <td className="px-3 py-2">{l.rate ?? "-"}</td>
              <td className="px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={counts[l.id] ?? ""}
                  disabled={!checked}
                  onChange={(ev) =>
                    onCount(l.id, parseInt(ev.target.value, 10) || 0)
                  }
                  className="w-20 px-1 py-1 border rounded"
                />
              </td>
            </tr>
          );
        })}
        {labor.length === 0 && (
          <tr>
            <td colSpan={8} className="py-4 text-center text-gray-500">
              No labor records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default LaborTable;
