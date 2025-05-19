"use client";

import React from "react";

const ProjectPhasePage = () => {
  const cols = [
    "#",
    "ID",
    "Project Name",
    "Phase",
    "Action List",
    "Due Date",
    "Responsible",
    "Progress",
    "Remark",
    "Status",
  ];

  const phases = ["Initiation", "Planning", "Execution", "Closure", "Summary"];

  // Static project data for five phases
  const mainData = phases.map((phase, idx) => ({
    id: `RC0${11 + idx}`,
    projectName: `Project ${String.fromCharCode(65 + idx)}`,
    phase,
    actionList: "Review and update",
    dueDate: `2025-06-${10 + idx}`,
    responsible: `User ${idx + 1}`,
    progress: `${(idx + 1) * 20}%`,
    remark: "-",
    status: idx < 4 ? "In Progress" : "Completed",
  }));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Project Phases</h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {cols.map((col, index) => (
              <th key={index} className="border p-2 bg-gray-100">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mainData.map((item, idx) => (
            <tr
              key={item.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="border p-2">{idx + 1}</td>
              <td className="border p-2">{item.id}</td>
              <td className="border p-2">{item.projectName}</td>
              <td className="border p-2">{item.phase}</td>
              <td className="border p-2 text-cyan-700">{item.actionList}</td>
              <td className="border p-2">{item.dueDate}</td>
              <td className="border p-2">{item.responsible}</td>
              <td className="border p-2">{item.progress}</td>
              <td className="border p-2">{item.remark}</td>
              <td className="border p-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectPhasePage;
