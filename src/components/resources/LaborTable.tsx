import { Labor } from "@/types/labor";

interface LaborProps {
  labor?: Labor[];
}

const LaborTable = ({ labor }: LaborProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "No",
              "Labor",
              "Unit",
              "Request Quantity",
              "Min Quantity",
              "Estimated Hour",
              "Rate",
              "Total Amount",
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {labor && labor.length > 0 ? (
            labor.map((lab, idx) => (
              <tr
                key={lab.activity_id + lab.requestId + idx}
                className="border border-gray-200"
              >
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{lab.role}</td>
                <td className="px-4 py-2 border border-gray-200">{lab.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.requestQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.minQuantity}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.estimatedHours}
                </td>
                <td className="px-4 py-2 border border-gray-200">{lab.rate}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.totalAmount}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 border border-gray-200 text-center"
                colSpan={9}
              >
                No labor records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LaborTable;
