"use client";

import React from "react";

const TodoTableSkeleton: React.FC = () => {
    const columnCount = 12; // Adjusted to match TodosTable columns (including Given Date)
    const rowCount = 8;

    return (
        <div className="overflow-x-auto w-full">
            <table className="min-w-[1400px] divide-y divide-gray-200 border border-gray-200 table-auto">
                <thead className="bg-cyan-700">
                    <tr>
                        {Array.from({ length: columnCount }).map((_, index) => (
                            <th key={index} className="px-4 py-3 whitespace-nowrap">
                                <div className="h-3 w-20 bg-cyan-600/50 rounded animate-pulse" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: rowCount }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="animate-pulse">
                            {Array.from({ length: columnCount }).map((_, colIndex) => (
                                <td key={colIndex} className="px-4 py-4 border border-gray-200 whitespace-nowrap">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TodoTableSkeleton;
