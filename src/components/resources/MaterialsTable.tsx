import { Material } from "@/types/material";

interface MaterialProps {
  materials: Material[] | undefined;
}

const MaterialsTable = ({ materials }: MaterialProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr className="border border-gray-200">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              No
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Material
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Unit
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Quantity
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Rate with VAT
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {materials && materials.length > 0 ? (
            materials.map((mat, index) => (
              <tr key={mat.id} className="border border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {index + 1}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {mat.item}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {mat.unit}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {mat.quantity}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {mat.rate_with_vat}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 whitespace-nowrap border border-gray-200"
                colSpan={5}
              >
                No materials available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MaterialsTable;
