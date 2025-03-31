import { Equipment } from "@/types/equipment";

interface EquipmentProps {
  equipment: Equipment[] | undefined;
}

const EquipmentTable = ({ equipment }: EquipmentProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr className="border border-gray-200">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              No
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Equipment
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Rate with VAT
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Reorder Qty
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Min Qty
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {equipment && equipment.length > 0 ? (
            equipment.map((eqp, index) => (
              <tr key={eqp.id} className="border border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {index + 1}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {eqp.item}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {eqp.rate_with_vat}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {eqp.reorder_quantity}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {eqp.min_quantity}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 whitespace-nowrap border border-gray-200"
                colSpan={5}
              >
                No equipment available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentTable;
