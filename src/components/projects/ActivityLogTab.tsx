// components/tabs/ActivityLogTab.tsx
import React from "react";

export default function ActivityLogTab() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-cyan-700 text-white">
            <th className="border px-3 py-2">Time</th>
            <th className="border px-3 py-2">User</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: map over your activity entries */}
          <tr>
            <td className="border px-3 py-2">2025-05-20 14:32</td>
            <td className="border px-3 py-2">Charlie</td>
            <td className="border px-3 py-2">Created new task “Design UI”</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
