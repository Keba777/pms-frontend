"use client";

import React from "react";
import { useUsers } from "@/hooks/useUsers";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

const UsersPage = () => {
  const { data: users, isLoading, isError } = useUsers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 text-center py-4">
        Failed to load users. Please try again.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-cyan-700">
            <tr>
              <th className="border border-gray-200 px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Name
              </th>
              <th className="border border-gray-200 px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Role
              </th>
              <th className="border border-gray-200 px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Email
              </th>
              <th className="border border-gray-200 px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Phone
              </th>
              <th className="border border-gray-200 px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-50">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                  <Link
                    href={`/users/profile/${user.id}`}
                    className="text-cyan-700 hover:text-cyan-900"
                  >
                    {`${user.first_name} ${user.last_name}`}
                  </Link>
                </td>
                <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                  {user.role?.name || "—"}
                </td>
                <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                  {user.phone}
                </td>
                <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                  {user.status || "Active"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
