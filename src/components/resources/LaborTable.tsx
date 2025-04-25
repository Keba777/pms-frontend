import { Labor } from "@/types/labor";

interface LaborProps {
  labor?: Labor[];
}

const LaborTable = ({ labor }: LaborProps) => {
  const headers = [
    "Select",
    "No",
    "Labor",
    "Unit",
    "Skill Level",
    "Min Quantity",
    "Estimated Hour",
    "Rate",
    "Total Amount",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-cyan-700">
          <tr>
            {headers.map((heading) => (
              <th
                key={heading}
                className="px-4 py-2 text-left text-xs font-medium text-gray-50 uppercase tracking-wider border border-gray-200"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {labor && labor.length > 0 ? (
            labor.map((lab, idx) => (
              <tr key={lab.id + idx} className="border border-gray-200">
                <td className="px-4 py-2 border border-gray-200">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                </td>
                <td className="px-4 py-2 border border-gray-200">{idx + 1}</td>
                <td className="px-4 py-2 border border-gray-200">{lab.role}</td>
                <td className="px-4 py-2 border border-gray-200">{lab.unit}</td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.skill_level ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.minQuantity ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.estimatedHours ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.rate ?? "-"}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {lab.totalAmount ?? "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 border border-gray-200 text-center"
                colSpan={headers.length}
              >
                No labor records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 rounded-lg bg-cyan-700 text-gray-100">
          Send to Request
        </button>
      </div>
    </div>
  );
};

export default LaborTable;
