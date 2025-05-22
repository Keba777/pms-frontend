// components/tabs/NotificationTab.tsx
import React from "react";

export default function NotificationTab() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      <ul className="space-y-2">
        {/* TODO: map over your notifications */}
        <li className="p-3 bg-gray-100 rounded">
          <span className="font-medium">System:</span> Project deadline
          approaching.
          <span className="text-sm text-gray-500 ml-2">2h ago</span>
        </li>
      </ul>
    </div>
  );
}
