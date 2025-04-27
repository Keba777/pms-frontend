import React from "react";

const ProjectTableSkeleton = () => {
  return (
    <div>
      <h2 className="text-3xl font-semibold mb-4 mt-6">Available Projects</h2>
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              {[
                "No",
                "PROJECTS",
                "Start Date",
                "End Date",
                "Duration",
                "Status",
                "Action",
              ].map((col) => (
                <th
                  key={col}
                  className="border border-gray-200 pl-5 pr-7 py-3 text-left text-sm font-medium text-gray-50"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white animate-pulse divide-y divide-gray-200">
            {Array.from({ length: 7 }).map((_, idx) => (
              <tr key={idx}>
                {Array.from({ length: 7 }).map((__, cell) => (
                  <td
                    key={cell}
                    className="border border-gray-200 pl-5 pr-7 py-4"
                  >
                    <div className="h-4 bg-gray-200 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ProjectTableSkeleton;
