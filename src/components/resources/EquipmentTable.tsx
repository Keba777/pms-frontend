import { Equipment } from "@/types/equipment";

interface EquipmentProps {
  equipment?: Equipment[];
}

const EquipmentTable = ({ equipment }: EquipmentProps) => {
  const headers = [
    "ID",
    "Equipment",
    "Unit",
    "Min Quantity",
    "Estimated Hour",
    "Rate",
    "Total",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-cyan-700">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {equipment && equipment.length > 0 ? (
            equipment.map((eqp, idx) => (
              <tr key={eqp.id + idx} className="border border-gray-200">
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{eqp.item}</td>
                <td className="px-4 py-2 border border-gray-200">{eqp.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.minQuantity ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.estimatedHours ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.rate ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {eqp.totalAmount ?? "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 border border-gray-200 text-center"
                colSpan={headers.length}
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
