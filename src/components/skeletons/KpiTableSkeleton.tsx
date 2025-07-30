import React from "react";

const KpiTableSkeleton: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-max divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-cyan-700">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Type
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Score
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Remark
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              User/Labor/Equipment
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Target
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Created At
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Actions
            </th>
          </tr>
        </thead>
        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/5"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="px-4 py-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KpiTableSkeleton;
