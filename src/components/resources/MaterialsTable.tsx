import { Material } from "@/types/material";

interface MaterialProps {
  materials?: Material[];
}

const MaterialsTable = ({ materials }: MaterialProps) => {
  const headers = [
    "No",
    "Materials",
    "Unit",
    "Req Quantity",
    "Min Quantity",
    "Rate",
    "Total Amount",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {materials && materials.length > 0 ? (
            materials.map((mat, idx) => (
              <tr
                key={mat.activityId + mat.requestId + idx}
                className="border border-gray-200"
              >
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{mat.item}</td>
                <td className="px-4 py-2 border border-gray-200">{mat.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {mat.requestQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {mat.minQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">{mat.rate}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {mat.totalAmount}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 border border-gray-200 text-center"
                colSpan={8}
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
