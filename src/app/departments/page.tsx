"use client";

import React from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { Department } from "@/types/department";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";

const DepartmentPage = () => {
  const { data: departments, isLoading, error } = useDepartments();

  return (
    <div className="p-6 bg-transparent">
      <div className="flex justify-between items-center mb-8">
        <p className="font-semibold">
          Home {" > "} Departments {" > "} List
        </p>
        <button className="bg-cyan-700 flex text-gray-200 font-medium text-xs px-3 py-2 rounded-md hover:bg-cyan-600 transition">
          <Plus size={14} className="mr-1" /> Create Department
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-600">Loading...</p>}
      {error && (
        <p className="text-center text-red-500">Error fetching departments.</p>
      )}

      {departments?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-cyan-700 text-white">
                <th className="border border-gray-300 px-4 py-2">
                  Department Name
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Sub-Departments
                </th>
                <th className="border border-gray-300 px-4 py-2">Created At</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department: Department) => (
                <tr
                  key={department.id}
                  className="bg-white hover:bg-gray-100 transition"
                >
                  <td className="border border-gray-300 px-4 py-2 font-semibold">
                    {department.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {department.subDepartment?.length ? (
                      <ul className="list-disc pl-5">
                        {department.subDepartment.map((sub, index) => (
                          <li key={index} className="text-gray-700">
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">No sub-departments</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">
                    {department.createdAt
                      ? format(new Date(department.createdAt), "PPpp")
                      : "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        department.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : department.status === "Inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {department.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                    <button className="p-2 text-cyan-700 border border-cyan-700 rounded-lg hover:bg-cyan-700 hover:text-white transition">
                      <Pencil size={16} />
                    </button>
                    <button className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">No departments available.</p>
      )}
    </div>
  );
};

export default DepartmentPage;
