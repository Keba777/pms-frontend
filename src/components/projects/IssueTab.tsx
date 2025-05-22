// components/tabs/IssueTab.tsx
import React from "react";

export default function IssueTab() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Issues</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-cyan-700 text-white">
            <th className="border px-3 py-2">#</th>
            <th className="border px-3 py-2">ID</th>
            <th className="border px-3 py-2">Type</th>
            <th className="border px-3 py-2">Description</th>
            <th className="border px-3 py-2">Raised By</th>
            <th className="border px-3 py-2">Priority</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* TODO: map over your issues */}
          <tr>
            <td className="border px-3 py-2 text-center">1</td>
            <td className="border px-3 py-2">ISSUE-001</td>
            <td className="border px-3 py-2">Bug</td>
            <td className="border px-3 py-2">Sample issue description</td>
            <td className="border px-3 py-2">Alice</td>
            <td className="border px-3 py-2">High</td>
            <td className="border px-3 py-2">Open</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
