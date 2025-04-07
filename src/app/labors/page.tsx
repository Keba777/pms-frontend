"use client";

import { useLabors } from "@/hooks/useLabors";
import { Edit, Trash2 } from "lucide-react";

const LaborPage = () => {
  const { data: labors, isLoading, error } = useLabors();

  if (isLoading) {
    return <div>Loading labors...</div>;
  }

  if (error) {
    return <div>Error loading labors.</div>;
  }

  return (
    <div className="p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Labor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hourly Rate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Skill Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Financial Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {(labors ?? []).map((labor) => (
            <tr key={labor.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {labor.total_labor}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {labor.hourly_rate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {labor.skill_level || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {labor.financial_status || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {labor.createdAt
                  ? new Date(labor.createdAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LaborPage;
