"use client"

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const DailyReportsPage = () => {
  const cols = [
    "#", "Days", "Date", "Site", "Assigned to", "Task",
    "Starting Date", "Due Date", "Duration", "Progress",
    "Approved By", "Remark", "Status",
  ];

  const subCols = [
    "#", "Title", "Checklists", "Remark", "Checked By",
    "Approved By", "Date", "Status", "Action",
  ];

  const titleValues = [
    "Work Progress", "Safety", "QC (Quality Control)", "Risk",
    "Equipment at Work", "Labor at Work", "Material Delivery",
    "Change", "Closure", "Payment Approval", "Labor Shift",
  ];

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
          id: 105,
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
          id: 106,
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
          id: 107,
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
          id: 108,
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
          id: 109,
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
          id: 110,
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
          id: 111,
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
  ];

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <nav className="mb-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <li><Link href="/" className="hover:text-cyan-700 transition-colors">Home</Link></li>
                <li className="flex items-center space-x-2">
                  <span>/</span>
                  <span className="text-gray-900">Task Reports</span>
                </li>
              </ol>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-cyan-800 uppercase tracking-tight">
              Daily Site Reports
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
              Consolidated work progress and safety updates
            </p>
          </div>
        </div>

        {/* Main Reports Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {cols.map((col, index) => (
                    <th key={index} className="px-4 py-4 text-[10px] font-black text-cyan-700 uppercase tracking-widest whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mainData.map((report) => (
                  <React.Fragment key={report.id}>
                    <tr className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-4 py-4 text-xs font-bold text-gray-400">{report.id}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleRow(report.id)}
                          className="flex items-center gap-2 group/btn"
                        >
                          <span className={`text-xs font-black uppercase tracking-tight transition-colors ${expandedRow === report.id ? "text-cyan-700" : "text-gray-900 group-hover:text-cyan-700"}`}>
                            {report.day}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-cyan-600 transition-transform ${expandedRow === report.id ? "rotate-90" : "group-hover/btn:translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">{report.date}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-900">{report.site}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-900">{report.assignedTo}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-900 truncate max-w-[150px]">{report.task}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">{report.startingDate}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">{report.dueDate}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-900">{report.duration}</td>
                      <td className="px-4 py-4">
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden min-w-[80px]">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: report.progress }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-emerald-600 mt-1 block uppercase">{report.progress}</span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-900">{report.approvedBy}</td>
                      <td className="px-4 py-4 text-xs font-bold text-gray-400 italic truncate max-w-[120px]">{report.remark}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap border border-cyan-100/50">
                          {report.status}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Content - Subtasks */}
                    {expandedRow === report.id && (
                      <tr>
                        <td colSpan={cols.length} className="px-4 pb-6 pt-2 bg-gray-50/30">
                          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="overflow-x-auto no-scrollbar">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-cyan-50/50 border-b border-cyan-100/20">
                                    {subCols.map((col, index) => (
                                      <th key={index} className="px-4 py-3 text-[9px] font-black text-cyan-800 uppercase tracking-tighter whitespace-nowrap">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {report.subtasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-4 py-3 text-[10px] font-bold text-gray-400">{task.id}</td>
                                      <td className="px-4 py-3 text-[10px] font-black text-gray-900 uppercase tracking-tight">{task.title}</td>
                                      <td className="px-4 py-3 text-[10px] font-bold text-gray-500">{task.checklist}</td>
                                      <td className="px-4 py-3 text-[10px] font-bold text-gray-400 italic">{task.remark}</td>
                                      <td className="px-4 py-3 text-[10px] font-bold text-gray-900">{task.checkedBy}</td>
                                      <td className="px-4 py-3 text-[10px] font-bold text-gray-900">{task.approvedBy}</td>
                                      <td className="px-4 py-3 text-[10px] font-bold text-gray-400">{task.date}</td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${task.status === "Approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                          }`}>
                                          {task.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <button className="text-[10px] font-black text-cyan-700 uppercase tracking-widest hover:underline active:scale-95 transition-all">
                                          {task.action}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportsPage;