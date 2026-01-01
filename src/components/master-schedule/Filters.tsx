import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import { Project } from "@/types/project";

export interface FilterValues {
  period: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
}

interface FiltersProps {
  projects: Project[];
  onChange: (filters: FilterValues) => void;
}

const Filters: React.FC<FiltersProps> = ({ projects, onChange }) => {
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // derive unique statuses & priorities
  const statuses = Array.from(new Set(projects.map((p) => p.status)));
  const priorities = Array.from(new Set(projects.map((p) => p.priority || "")));

  // emit on any change
  useEffect(() => {
    onChange({ period, status, priority, startDate, endDate });
  }, [period, status, priority, startDate, endDate, onChange]);

  const clearAll = () => {
    setPeriod("");
    setStatus("");
    setPriority("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
      >
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
      >
        <option value="">All Priorities</option>
        {priorities.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
        placeholder="Start ≥"
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all outline-none"
        placeholder="End ≤"
      />

      <button
        onClick={clearAll}
        className="flex items-center justify-center rounded-lg border border-red-100 px-4 py-2.5 text-sm font-black text-red-600 bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
      >
        <XCircle size={18} className="mr-2" />
        Clear
      </button>
    </div>
  );
};

export default Filters;
