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

  // Apply filters
  const filtered = useMemo(() => {
    // derive period boundaries
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
        const day = now.getDay(); // 0 (Sun) - 6
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
      const start = new Date(p.start_date);
      if (periodStart) {
        if (start < periodStart || start > new Date()) return false;
      }
      if (filters.status && p.status !== filters.status) return false;
      if (filters.priority && p.priority !== filters.priority) return false;
      if (
        filters.startDate &&
        new Date(p.start_date) < new Date(filters.startDate)
      )
        return false;
      if (filters.endDate && new Date(p.end_date) > new Date(filters.endDate))
        return false;
      return true;
    });
  }, [projects, filters]);

  // Apply sorting
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
    // end_date
    return copy.sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    );
  }, [filtered, sortBy]);

  // Columns for download/export
  const columns: Column<Project>[] = [
    { header: "No", accessor: (_: Project) => projects.indexOf(_) + 1 },
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
      <h2 className="text-4xl font-bold mb-6">Master Schedule</h2>

      {/* View Toggle Buttons */}
      <div className="flex mb-8 gap-4">
        <button
          onClick={() => setView("schedule")}
          className={`flex items-center px-4 py-2 rounded shadow ${
            view === "schedule"
              ? "bg-white border border-gray-300"
              : "bg-gray-200"
          }`}
        >
          <Wrench size={18} className="mr-2 text-amber-500" />
          Schedule
        </button>
        <button
          onClick={() => setView("gantt")}
          className={`flex items-center px-4 py-2 rounded shadow ${
            view === "gantt" ? "bg-white border border-gray-300" : "bg-gray-200"
          }`}
        >
          <Send size={18} className="mr-2 text-emerald-600" />
          Gantt Chart
        </button>
      </div>

      {/* Filters */}
      <Filters projects={projects} onChange={setFilters} />

      {/* Sort Select */}
      <div className="flex items-center mb-6">
        <label htmlFor="sortBy" className="mr-3 font-medium">
          Sort by:
        </label>
        <div className="relative inline-block">
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
            className="appearance-none pr-8 border border-gray-300 bg-white text-gray-700 py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-cyan-600"
          >
            <option value="default">Default Order</option>
            <option value="title">Project Name</option>
            <option value="start_date">Start Date</option>
            <option value="end_date">End Date</option>
          </select>
          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
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
        <ProjectGanttChart projects={filtered} viewMode={ViewMode.Month} />
      )}
    </section>
  );
};

export default MasterSchedulePage;
