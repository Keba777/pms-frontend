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
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
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
        className="w-full rounded-md border px-3 py-2"
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
        className="w-full rounded-md border px-3 py-2"
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
        className="w-full rounded-md border px-3 py-2"
        placeholder="Start ≥"
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
        placeholder="End ≤"
      />

      <button
        onClick={clearAll}
        className="flex items-center justify-center rounded-md border px-3 py-2 text-red-600 hover:bg-gray-100"
      >
        <XCircle size={18} className="mr-1" />
        Clear
      </button>
    </div>
  );
};

export default Filters;
