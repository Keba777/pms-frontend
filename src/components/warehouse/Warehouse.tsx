import { Material } from "@/types/material";

interface MaterialsTableProps {
  materials?: Material[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials = [],
  selectedIds,
  onSelect,
}) => {
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
            <th className="border px-3 py-2">Re-Qty</th>
            <th className="border px-3 py-2">Rate</th>
            <th className="border px-3 py-2">Total</th>
            <th className="border px-3 py-2">Shelf No</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, idx) => {
            const checked = selectedIds.includes(m.id);
            return (
              <tr key={m.id} className="border-b">
                <td className="border px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onSelect(m.id, e.target.checked)}
                  />
                </td>
                <td className="border px-3 py-2 text-center">{idx + 1}</td>
                <td className="border px-3 py-2 text-center">{m.item}</td>
                <td className="border px-3 py-2 text-center">{"-"}</td>
                <td className="border px-3 py-2 text-center">{m.unit}</td>
                <td className="border px-3 py-2 text-center">
                  {m.minQuantity ?? "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {m.minQuantity ?? "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {/* {m.minQuantity === 100? "" } quantitiy <== givenQunatity Reorder:   less than given quantitiy */}
                </td>
                <td className="border px-3 py-2 text-center">
                  {m.rate ?? "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {m.rate !== undefined && m.minQuantity !== undefined
                    ? m.rate * m.minQuantity
                    : "-"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {"0"}
                </td>
                <td className="border px-3 py-2 text-center">
                  {m.minQuantity === 0
                    ? "Not Available": "Available"}
                </td>
              </tr>
            );
          })}
          {materials.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="border px-3 py-4 text-center text-gray-500"
              >
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
