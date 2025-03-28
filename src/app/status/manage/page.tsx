"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";

const StatusPage = () => {
  // Static statuses with preview badge colors
  const statuses = [
    {
      id: 1,
      title: "Blocked",
      preview: "Blocked",
      color: "bg-red-100 text-red-700",
    },
    {
      id: 2,
      title: "Not Started",
      preview: "Not Started",
      color: "bg-gray-100 text-gray-700",
    },
    {
      id: 3,
      title: "In Progress",
      preview: "In Progress",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      id: 4,
      title: "Completed",
      preview: "Completed",
      color: "bg-green-100 text-green-700",
    },
    {
      id: 5,
      title: "Onhold",
      preview: "Onhold",
      color: "bg-blue-100 text-blue-700",
    },
  ];

  // State to manage selected statuses (store IDs)
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);

  // Check if all statuses are selected
  const isAllSelected = statuses.length === selectedStatuses.length;

  // Toggle the master checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all statuses
      setSelectedStatuses(statuses.map((status) => status.id));
    } else {
      // Deselect all statuses
      setSelectedStatuses([]);
    }
  };

  // Toggle a single row checkbox
  const handleSelectRow = (id: number) => {
    if (selectedStatuses.includes(id)) {
      setSelectedStatuses(selectedStatuses.filter((sid) => sid !== id));
    } else {
      setSelectedStatuses([...selectedStatuses, id]);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-5 mt-8">
        <nav aria-label="breadcrumb">
          <ol className="flex space-x-2 text-sm font-semibold">
            <li>
              <Link href="/" className="hover:underline flex items-center">
                Home
              </Link>
            </li>
            <li className="text-gray-400">{">"}</li>
            <li className="text-gray-600">Statuses</li>
          </ol>
        </nav>
      </div>
      <div className="bg-white rounded-lg shadow p-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="border border-gray-300">
              <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium">
                ID
              </th>
              <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium">
                TITLE
              </th>
              <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium">
                PREVIEW
              </th>
              <th className="px-4 py-3 border border-gray-300 text-left text-sm font-medium">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.id} className="hover:bg-gray-100">
                <td className="px-4 py-3 border border-gray-300">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedStatuses.includes(status.id)}
                    onChange={() => handleSelectRow(status.id)}
                  />
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  {status.id}
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  {status.title}
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  <span className={`px-2 py-1 rounded ${status.color}`}>
                    {status.preview}
                  </span>
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  <div className="flex space-x-2">
                    <button aria-label="Edit">
                      <Edit className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                    </button>
                    <button aria-label="Delete">
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusPage;
