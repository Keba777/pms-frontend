import { Labor } from "@/types/labor";

interface LaborProps {
  labor: Labor[] | undefined;
}

const LaborTable = ({ labor }: LaborProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr className="border border-gray-200">
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              No
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Total Labor
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Hourly Rate
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
              Skill Level
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {labor && labor.length > 0 ? (
            labor.map((lab, index) => (
              <tr key={lab.id} className="border border-gray-200">
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {index + 1}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {lab.total_labor}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {lab.hourly_rate}
                </td>
                <td className="px-4 py-2 whitespace-nowrap border border-gray-200">
                  {lab.skill_level || "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr className="border border-gray-200">
              <td
                className="px-4 py-2 whitespace-nowrap border border-gray-200"
                colSpan={4}
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
