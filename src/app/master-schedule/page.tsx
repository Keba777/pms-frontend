"use client";

import Filters from "@/components/master-schedule/Filters";
import ProjectTable from "@/components/master-schedule/ProjectTable";
import { Send, Wrench } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import React from "react";

const MasterSchedulePage = () => {
  const { projects } = useProjectStore();

  return (
    <section className="pt-6">
      <h2 className="text-4xl font-bold mb-6">Master Schedule</h2>
      <div className="flex mb-8">
        <button className="flex items-center bg-white px-4 py-2">
          <Wrench size={18} strokeWidth={2} className="text-amber-500 mr-2" />{" "}
          Schedule
        </button>
        <button className="flex items-center bg-gray-200 px-4 py-2">
          <Send size={18} strokeWidth={2} className="text-emerald-600 mr-2" />{" "}
          Gantt Chart
        </button>
      </div>
      <Filters projects={projects || []} />
      <ProjectTable />
    </section>
  );
};

export default MasterSchedulePage;
