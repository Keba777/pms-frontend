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
    return <p className="text-center text-xl text-muted-foreground p-10">Loading...</p>;
  if (error)
    return (
      <p className="text-center text-xl text-destructive font-bold p-10">
        Error fetching requests: {error.message}
      </p>
    );

  return (
    <div className="container mx-auto px-4 py-6 bg-background min-h-screen">
      <h2 className="text-3xl font-black mb-6 text-primary uppercase tracking-tight">Requests</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((request) => (
          <div key={request.id} className="bg-card p-6 rounded-2xl shadow-sm border border-border transition-all hover:shadow-md">
            <h3 className="text-xl font-bold text-primary mb-2">
              Status: {request.status}
            </h3>
            <p className="text-foreground/80">
              Material Count: {request.materialCount}
            </p>
            <p className="text-foreground/80">Labor Count: {request.laborCount}</p>
            <p className="text-foreground/80">
              Equipment Count: {request.equipmentCount}
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-bold text-sm shadow-sm"
                onClick={() => handleUpdateRequest(request)}
              >
                Update Status
              </button>
              <button
                className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-all font-bold text-sm"
                onClick={() => handleDeleteRequest(request.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto bg-card shadow-sm border border-border rounded-2xl">
        <table className="min-w-full table-auto">
          <thead className="bg-primary text-primary-foreground">
            <tr>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Material Count</th>
              <th className="px-6 py-3 text-left">Labor Count</th>
              <th className="px-6 py-3 text-left">Equipment Count</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.map((request) => (
              <tr key={request.id} className="hover:bg-accent transition-colors">
                <td className="px-6 py-4">{request.status}</td>
                <td className="px-6 py-4 font-medium">{request.materialCount}</td>
                <td className="px-6 py-4 font-medium">{request.laborCount}</td>
                <td className="px-6 py-4 font-medium">{request.equipmentCount}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-3">
                    <button
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-xs font-bold"
                      onClick={() => handleUpdateRequest(request)}
                    >
                      Update
                    </button>
                    <button
                      className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-all text-xs font-bold"
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
