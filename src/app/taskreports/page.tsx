"use client"

import React, { useState } from "react";

const DailyReportsPage = () => {
  const cols = [
    "#",
    "Days",
    "Date",
    "Site",
    "Assigned to",
    "Task",
    "Starting Date",
    "Due Date",
    "Duration",
    "Progress",
    "Approved By",
    "Remark",
    "Status",
  ];

  const subCols = [
    "#",
    "Title",
    "List of Checklists",
    "Remark",
    "Checked By",
    "Approved By",
    "Date",
    "Status",
    "Action",
  ];

  const titleValues = [
    "Work Progress",
    "Safety",
    "QC (Quality Control)",
    "Risk",
    "Equipment at Work",
    "Labor at Work",
    "Material Delivery",
    "Change",
    "Closure",
    "Payment Approval",
    "Labor Shift",
  ];

  // Static main table data
  const mainData = [
    {
      id: 1,
      day: "Monday",
      date: "2025-05-16",
      site: "Site A",
      assignedTo: "John",
      task: "Inspection",
      startingDate: "2025-05-15",
      dueDate: "2025-05-20",
      duration: "5 days",
      progress: "50%",
      approvedBy: "Manager A",
      remark: "On track",
      status: "In Progress",
      subtasks: [
        {
          id: 101,
          title: titleValues[0],
          checklist: "Check A, Check B",
          remark: "All good",
          checkedBy: "Supervisor A",
          approvedBy: "Manager A",
          date: "2025-05-16",
          status: "Approved",
          action: "View",
        },
        {
          id: 102,
          title: titleValues[1],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
        {
          id: 103,
          title: titleValues[2],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
        {
          id: 104,
          title: titleValues[3],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[4],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[5],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[6],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[7],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[8],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[9],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
                {
          id: 104,
          title: titleValues[10],
          checklist: "Check C",
          remark: "Pending",
          checkedBy: "Supervisor B",
          approvedBy: "Manager B",
          date: "2025-05-16",
          status: "Pending",
          action: "Edit",
        },
      ],
    },
    // Add more main rows here if needed
  ];

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daily Reports</h2>
      <table className="table-auto w-full border-collapse border border-gray-300 mb-4">
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
          {mainData.map((report) => (
            <React.Fragment key={report.id}>
              <tr>
                <td className="border p-2">{report.id}</td>
                <td
                  className="border p-2 text-cyan-700 cursor-pointer underline"
                  onClick={() => toggleRow(report.id)}
                >
                  {report.day}
                </td>
                <td className="border p-2">{report.date}</td>
                <td className="border p-2">{report.site}</td>
                <td className="border p-2">{report.assignedTo}</td>
                <td className="border p-2">{report.task}</td>
                <td className="border p-2">{report.startingDate}</td>
                <td className="border p-2">{report.dueDate}</td>
                <td className="border p-2">{report.duration}</td>
                <td className="border p-2">{report.progress}</td>
                <td className="border p-2">{report.approvedBy}</td>
                <td className="border p-2">{report.remark}</td>
                <td className="border p-2">{report.status}</td>
              </tr>
              {expandedRow === report.id && (
                <tr>
                  <td colSpan={cols.length} className="border p-2 bg-gray-100">
                    <table className="table-auto w-full border border-gray-200">
                      <thead>
                        <tr>
                          {subCols.map((col, index) => (
                            <th key={index} className="border p-2 bg-gray-100">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.subtasks.map((task) => (
                          <tr key={task.id}>
                            <td className="border p-2">{task.id}</td>
                            <td className="border p-2">{task.title}</td>
                            <td className="border p-2">{task.checklist}</td>
                            <td className="border p-2">{task.remark}</td>
                            <td className="border p-2">{task.checkedBy}</td>
                            <td className="border p-2">{task.approvedBy}</td>
                            <td className="border p-2">{task.date}</td>
                            <td className="border p-2">{task.status}</td>
                            <td className="border p-2 text-cyan-700 cursor-pointer">
                              {task.action}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyReportsPage;