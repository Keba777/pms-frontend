import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiTableSkeletonProps {
  tableType: "users" | "labors" | "equipment";
  selectedColumns: string[];
}

const KpiTableSkeleton: React.FC<KpiTableSkeletonProps> = ({ tableType, selectedColumns }) => {
  return (
    <table className="w-full divide-y divide-gray-200">
      <thead className="bg-cyan-700">
        <tr>
          {selectedColumns.includes("type") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Type
            </th>
          )}
          {selectedColumns.includes("score") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Score
            </th>
          )}
          {selectedColumns.includes("remark") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Remark
            </th>
          )}
          {selectedColumns.includes("userLabor") && tableType === "users" && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              User
            </th>
          )}
          {selectedColumns.includes("laborInformation") &&
            tableType === "labors" && (
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Labor Info
              </th>
            )}
          {selectedColumns.includes("equipment") &&
            tableType === "equipment" && (
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
                Equipment
              </th>
            )}
          {selectedColumns.includes("target") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Target
            </th>
          )}
          {selectedColumns.includes("status") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Status
            </th>
          )}
          {selectedColumns.includes("createdAt") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Created At
            </th>
          )}
          {selectedColumns.includes("actions") && (
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-50">
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[...Array(5)].map((_, index) => (
          <tr key={index} className="animate-pulse">
            {selectedColumns.includes("type") && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[100px]" />
              </td>
            )}
            {selectedColumns.includes("score") && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[50px]" />
              </td>
            )}
            {selectedColumns.includes("remark") && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[200px]" />
              </td>
            )}
            {selectedColumns.includes("userLabor") && tableType === "users" && (
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-[150px] ml-2" />
                </div>
              </td>
            )}
            {selectedColumns.includes("laborInformation") && tableType === "labors" && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[150px]" />
              </td>
            )}
            {selectedColumns.includes("equipment") && tableType === "equipment" && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[150px]" />
              </td>
            )}
            {selectedColumns.includes("target") && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[50px]" />
              </td>
            )}
            {selectedColumns.includes("status") && (
              <td className="px-4 py-2">
                <Skeleton className="h-5 w-[80px] rounded" />
              </td>
            )}
            {selectedColumns.includes("createdAt") && (
              <td className="px-4 py-2">
                <Skeleton className="h-4 w-[150px]" />
              </td>
            )}
            {selectedColumns.includes("actions") && (
              <td className="px-4 py-2">
                <Skeleton className="h-8 w-[100px] rounded" />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default KpiTableSkeleton;
