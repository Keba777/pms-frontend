"use client";

import React, { useState, useMemo } from "react";
import { Wrench, Send } from "lucide-react";
import { ViewMode } from "gantt-task-react";
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
    status: "",
    priority: "",
    startDate: "",
    endDate: "",
  });

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.priority && p.priority !== filters.priority) return false;
      if (filters.startDate && new Date(p.start_date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(p.end_date) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [projects, filters]);

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
            view === "gantt"
              ? "bg-white border border-gray-300"
              : "bg-gray-200"
          }`}
        >
          <Send size={18} className="mr-2 text-emerald-600" />
          Gantt Chart
        </button>
      </div>

      <Filters projects={projects} onChange={setFilters} />

      {view === "schedule" ? (
        <>
          <GenericDownloads<Project>
            data={filtered}
            title="Master Schedule"
            columns={columns}
          />
          <ProjectTable projects={filtered} />
        </>
      ) : (
        <ProjectGanttChart projects={filtered} viewMode={ViewMode.Week} />
      )}
    </section>
  );
};

export default MasterSchedulePage;
