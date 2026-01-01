"use client";

import React, { useState, useMemo } from "react";
import { Wrench, Send, ChevronDown } from "lucide-react";
import { ViewMode } from "frappe-gantt-react";
import { useProjectStore } from "@/store/projectStore";
import Filters, { FilterValues } from "@/components/master-schedule/Filters";
import ProjectTable from "@/components/master-schedule/ProjectTable";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Project } from "@/types/project";
import ProjectGanttChart from "@/components/master-schedule/ProjectGanttChart";

const MasterSchedulePage: React.FC = () => {
  const { projects = [] } = useProjectStore();

  const [view, setView] = useState<"schedule" | "gantt">("schedule");
  const [filters, setFilters] = useState<FilterValues>({
    period: "",
    status: "",
    priority: "",
    startDate: "",
    endDate: "",
  });
  const [sortBy, setSortBy] = useState<
    "default" | "title" | "start_date" | "end_date"
  >("default");

  // 1) Filter the projects array based on the selected "filters"
  const filtered = useMemo(() => {
    let periodStart: Date | null = null;
    const now = new Date();

    switch (filters.period) {
      case "today":
        periodStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        break;
      case "week": {
        const day = now.getDay(); // 0 (Sun) - 6 (Sat)
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        periodStart = new Date(now.setDate(diff));
        break;
      }
      case "month":
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        break;
    }

    return projects.filter((p) => {
      const startDate = new Date(p.start_date);

      if (periodStart) {
        if (startDate < periodStart || startDate > new Date()) {
          return false;
        }
      }
      if (filters.status && p.status !== filters.status) {
        return false;
      }
      if (filters.priority && p.priority !== filters.priority) {
        return false;
      }
      if (
        filters.startDate &&
        new Date(p.start_date) < new Date(filters.startDate)
      ) {
        return false;
      }
      if (filters.endDate && new Date(p.end_date) > new Date(filters.endDate)) {
        return false;
      }
      return true;
    });
  }, [projects, filters]);

  // 2) Sort the filtered array
  const sortedProjects = useMemo(() => {
    if (sortBy === "default") return filtered;

    const copy = [...filtered];
    if (sortBy === "title") {
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === "start_date") {
      return copy.sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    }
    // If end_date
    return copy.sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    );
  }, [filtered, sortBy]);

  // 3) Setup columns for CSV / XLSX export
  const columns: Column<Project>[] = [
    {
      header: "No",
      accessor: (_: Project) => projects.indexOf(_) + 1,
    },
    { header: "Project", accessor: "title" },
    {
      header: "Start Date",
      accessor: (r) => new Date(r.start_date).toISOString().split("T")[0],
    },
    {
      header: "End Date",
      accessor: (r) => new Date(r.end_date).toISOString().split("T")[0],
    },
    {
      header: "Budget",
      accessor: (r) =>
        typeof r.budget === "number" ? r.budget.toLocaleString() : "",
    },
    { header: "Status", accessor: "status" },
  ];

  return (
    <section className="pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-black text-cyan-800">Master Schedule</h2>

        {/* View Toggle Buttons */}
        <div className="flex p-1 bg-gray-200 rounded-xl gap-1">
          <button
            onClick={() => setView("schedule")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-bold text-sm ${view === "schedule"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-300"
              }`}
          >
            <Wrench size={18} className={view === "schedule" ? "text-amber-500" : "text-gray-400"} />
            Schedule
          </button>
          <button
            onClick={() => setView("gantt")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-bold text-sm ${view === "gantt"
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-300"
              }`}
          >
            <Send size={18} className={view === "gantt" ? "text-emerald-600" : "text-gray-400"} />
            Gantt Chart
          </button>
        </div>
      </div>

      {/* Filters Container */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <Filters projects={projects} onChange={setFilters} />

        {/* Sort Select */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
          <label htmlFor="sortBy" className="text-xs font-black uppercase text-gray-400 tracking-wider">
            Sort by:
          </label>
          <div className="relative inline-block min-w-[200px]">
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                  | "default"
                  | "title"
                  | "start_date"
                  | "end_date"
                )
              }
              className="w-full appearance-none pr-10 border border-gray-200 bg-white text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 font-bold text-sm transition-all hover:border-gray-300"
            >
              <option value="default">Default Order</option>
              <option value="title">Project Name</option>
              <option value="start_date">Start Date</option>
              <option value="end_date">End Date</option>
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {view === "schedule" ? (
        <>
          <GenericDownloads<Project>
            data={sortedProjects}
            title="Master Schedule"
            columns={columns}
          />
          <ProjectTable projects={sortedProjects} />
        </>
      ) : (
        <ProjectGanttChart
          /** Pass in exactly the filtered array */
          projects={filtered}
          viewMode={ViewMode.Month}
        />
      )}
    </section>
  );
};

export default MasterSchedulePage;
