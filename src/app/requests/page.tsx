"use client";

import React from "react";
import {
  useRequests,
  useDeleteRequest,
  useUpdateRequest,
} from "@/hooks/useRequests";
import { Request } from "@/types/request";

// RequestPage Component
const RequestPage = () => {
  const { data, isLoading, error } = useRequests();
  const { mutate: updateRequest } = useUpdateRequest();
  const { mutate: deleteRequest } = useDeleteRequest();

  const handleUpdateRequest = (request: Request) => {
    updateRequest({ id: request.id, status: "In Progress" }); // example update
  };

  const handleDeleteRequest = (id: string) => {
    deleteRequest(id);
  };

  // Displaying error or loading state
  if (isLoading)
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  if (error)
    return (
      <p className="text-center text-xl text-red-500">
        Error fetching requests: {error.message}
      </p>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold mb-6 text-cyan-800">Requests</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-cyan-800">
              Status: {request.status}
            </h3>
            <p className="text-gray-700">
              Material Count: {request.materialCount}
            </p>
            <p className="text-gray-700">Labor Count: {request.laborCount}</p>
            <p className="text-gray-700">
              Equipment Count: {request.equipmentCount}
            </p>
            <div className="mt-4 flex space-x-3">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={() => handleUpdateRequest(request)}
              >
                Update Status
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                onClick={() => handleDeleteRequest(request.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-cyan-700 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Material Count</th>
              <th className="px-6 py-3 text-left">Labor Count</th>
              <th className="px-6 py-3 text-left">Equipment Count</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((request) => (
              <tr key={request.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{request.status}</td>
                <td className="px-6 py-4">{request.materialCount}</td>
                <td className="px-6 py-4">{request.laborCount}</td>
                <td className="px-6 py-4">{request.equipmentCount}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      onClick={() => handleUpdateRequest(request)}
                    >
                      Update
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      Delete
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

export default RequestPage;
