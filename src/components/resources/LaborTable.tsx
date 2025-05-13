import { Labor } from "@/types/labor";

interface LaborTableProps {
  labor?: Labor[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
}

const LaborTable: React.FC<LaborTableProps> = ({
  labor = [],
  selectedIds,
  onSelect,
}) => (
  <div className="overflow-x-auto">
    <h3 className="text-lg font-semibold mb-2 text-center">Labor</h3>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead className="bg-cyan-700 text-white text-center">
        <tr>
          <th className="border px-3 py-2">Select</th>
          <th className="border px-3 py-2">No</th>
          <th className="border px-3 py-2">Role</th>
          <th className="border px-3 py-2">Unit</th>
          <th className="border px-3 py-2">Qty</th>
          <th className="border px-3 py-2">Min-Qty</th>
          <th className="border px-3 py-2">Rate</th>
          <th className="border px-3 py-2">OT</th>
          <th className="border px-3 py-2">Total</th>
        </tr>
      </thead>
      <tbody>
        {labor.map((l, idx) => {
          const checked = selectedIds.includes(l.id);
          return (
            <tr key={l.id} className="border-b text-center">
              <td className="border px-3 py-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(ev) => onSelect(l.id, ev.target.checked)}
                />
              </td>
              <td className="border px-3 py-2">{idx + 1}</td>
              <td className="border px-3 py-2">{l.role}</td>
              <td className="border px-3 py-2">{l.unit}</td>
              <td className="border px-3 py-2">{l.quantity ?? "-"}</td>
              <td className="border px-3 py-2">{l.minQuantity ?? "0"}</td>
              <td className="border px-3 py-2">{l.rate ?? "-"}</td>
              <td className="border px-3 py-2">{l.overtimeRate}</td>
              <td className="border px-3 py-2">{l.totalAmount}</td>
            </tr>
          );
        })}
        {labor.length === 0 && (
          <tr>
            <td
              colSpan={7}
              className="border px-3 py-4 text-center text-gray-500"
            >
              No labor records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default LaborTable;
