import { Equipment } from "@/types/equipment";

interface EquipmentTableProps {
  equipment?: Equipment[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment = [],
  selectedIds,
  onSelect,
}) => (
  <div className="overflow-x-auto">
    <h3 className="text-lg font-semibold mb-2 text-center">Equipment</h3>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead className="bg-cyan-700 text-white text-center">
        <tr>
          <th className="border px-3 py-2">Select</th>
          <th className="border px-3 py-2">No</th>
          <th className="border px-3 py-2">Name</th>
          <th className="border px-3 py-2">Unit</th>
          <th className="border px-3 py-2">Qty</th>
          <th className="border px-3 py-2">Rate</th>
        </tr>
      </thead>
      <tbody>
        {equipment.map((e, idx) => {
          const checked = selectedIds.includes(e.id);
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
              <td className="border px-3 py-2 text-center">{e.unit}</td>
              <td className="border px-3 py-2 text-center">
                {e.minQuantity ?? "-"}
              </td>
              <td className="border px-3 py-2 text-center">{e.rate ?? "-"}</td>
            </tr>
          );
        })}
        {equipment.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="border px-3 py-4 text-center text-gray-500"
            >
              No equipment found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default EquipmentTable;
