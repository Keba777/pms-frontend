"use client";

import React, { useEffect } from "react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";

const NotificationPage = () => {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  useEffect(() => {
    if (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-cyan-700 rounded-t-md">
          <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            className="px-4 py-2 bg-white text-cyan-700 font-medium rounded-md hover:bg-gray-200 transition"
          >
            Mark All Read
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No notifications found.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex justify-between items-center px-6 py-4 ${
                  n.read ? "bg-white" : "bg-gray-200"
                }`}
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">{n.type}</p>
                  {n.data && (
                    <p className="text-sm text-gray-600 truncate">
                      {JSON.stringify(n.data)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt!).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsReadMutation.mutate(n.id!)}
                    className="px-3 py-1 bg-cyan-700 text-white text-sm rounded-md hover:bg-cyan-800 transition"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
