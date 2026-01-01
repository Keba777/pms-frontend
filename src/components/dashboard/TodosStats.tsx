"use client";

import React from "react";
import Card from "@/components/common/ui/Card";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  ListTodo,
  Clock,
  Calendar,
  AlertTriangle,
  Flag,
  CheckSquare,
} from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { Todo } from "@/types/todo";
import Link from "next/link";


const ICON_COLORS = {
  cyan700: "#0e7490",
  gray200: "#e5e7eb",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray700: "#374151",
};

function startOfDay(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function endOfDay(d: Date) {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt;
}
function isSameDay(a?: Date | string, b?: Date) {
  if (!a || !b) return false;
  const da = startOfDay(new Date(a));
  const db = startOfDay(b);
  return da.getTime() === db.getTime();
}
function isWithinNDays(from: Date, target: Date, n: number) {
  const start = startOfDay(from).getTime();
  const end = endOfDay(new Date(start + (n - 1) * 24 * 3600 * 1000)).getTime();
  const t = target.getTime();
  return t >= start && t <= end;
}
function isSameMonth(a?: Date | string, b?: Date) {
  if (!a || !b) return false;
  const da = new Date(a);
  return da.getMonth() === b.getMonth() && da.getFullYear() === b.getFullYear();
}

export default function TodosStats() {
  const { data: todos, isLoading } = useTodos();

  const totalTodos = todos?.length || 0;

  const parsedTodos: Todo[] = (todos || []).map((t) => ({
    ...t,

    dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
    target: t.target ? new Date(t.target) : new Date(),
    givenDate: t.givenDate ? new Date(t.givenDate) : new Date(),
  }));

  const statusMap = parsedTodos.reduce<Record<string, number>>((acc, todo) => {
    const status = todo.status ?? "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusItems = [
    {
      label: "Not Started",
      value: statusMap["Not Started"] || 0,
      icon: <ListTodo size={16} />,
      iconColor: ICON_COLORS.gray700,
      link: "/todos?status=Not%20Started",
    },
    {
      label: "In progress",
      value: statusMap["In progress"] || 0,
      icon: <CheckSquare size={16} />,
      iconColor: ICON_COLORS.cyan700,
      link: "/todos?status=In%20progress",
    },
    {
      label: "Pending",
      value: statusMap["Pending"] || 0,
      icon: <Clock size={16} />,
      iconColor: ICON_COLORS.gray500,
      link: "/todos?status=Pending",
    },
    {
      label: "Completed",
      value: statusMap["Completed"] || 0,
      icon: <CheckSquare size={16} />,
      iconColor: ICON_COLORS.gray400,
      link: "/todos?status=Completed",
    },
  ];


  const priorityMap = parsedTodos.reduce<Record<string, number>>((acc, todo) => {
    const p = todo.priority ?? "Medium";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const priorityItems = [
    {
      label: "Urgent",
      value: priorityMap["Urgent"] || 0,
      icon: <AlertTriangle size={16} />,
      iconColor: ICON_COLORS.gray700,
      link: "/todos?priority=Urgent",
    },
    {
      label: "High",
      value: priorityMap["High"] || 0,
      icon: <Flag size={16} />,
      iconColor: ICON_COLORS.cyan700,
      link: "/todos?priority=High",
    },
    {
      label: "Medium",
      value: priorityMap["Medium"] || 0,
      icon: <Flag size={16} />,
      iconColor: ICON_COLORS.gray500,
      link: "/todos?priority=Medium",
    },
    {
      label: "Low",
      value: priorityMap["Low"] || 0,
      icon: <Flag size={16} />,
      iconColor: ICON_COLORS.gray400,
      link: "/todos?priority=Low",
    },
  ];

  const today = startOfDay(new Date());
  const todayCount = parsedTodos.filter((t) =>
    t.dueDate ? isSameDay(t.dueDate, today) : false
  ).length;


  const thisWeekCount = parsedTodos.filter((t) =>
    t.dueDate ? isWithinNDays(today, t.dueDate as Date, 7) : false
  ).length;


  const thisMonthCount = parsedTodos.filter((t) =>
    t.dueDate ? isSameMonth(t.dueDate, today) : false
  ).length;


  const upcomingTodos = parsedTodos
    .filter((t) => t.dueDate && (t.dueDate as Date).getTime() >= today.getTime())
    .sort((a, b) => (a.dueDate as Date).getTime() - (b.dueDate as Date).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="text-center space-y-2 mt-8 mb-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-800">
          Todo Statistics
        </h2>
        <div className="w-24 h-1 bg-cyan-600 mx-auto rounded-full" />
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -mx-2 mt-4">
        <Card
          title="Total Todos"
          count={isLoading ? 0 : totalTodos}
          link="/todos"
          Icon={ListTodo}
          color="cyan-700"
        />
        <Card
          title="Due Today"
          count={isLoading ? 0 : todayCount}
          link="/todos?filter=due_today"
          Icon={Calendar}
          color="cyan-700"
        />
        <Card
          title="Due This Week"
          count={isLoading ? 0 : thisWeekCount}
          link="/todos?filter=due_week"
          Icon={Clock}
          color="cyan-700"
        />
        <Card
          title="Due This Month"
          count={isLoading ? 0 : thisMonthCount}
          link="/todos?filter=due_month"
          Icon={Calendar}
          color="cyan-700"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8 mb-12">
        <StatsCard title="Todos by Status" items={statusItems} total={totalTodos} />
        <StatsCard title="Todos by Priority" items={priorityItems} total={totalTodos} />


        <div className="bg-gray-200 border border-gray-300 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={20} />
              <h3 className="text-lg font-semibold">Upcoming Todos</h3>
            </div>
            <Link href="/todos" className="text-sm text-gray-700 underline">
              View all
            </Link>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : upcomingTodos.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming todos</p>
          ) : (
            <ul className="space-y-3">
              {upcomingTodos.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start justify-between gap-3 p-2 rounded-md hover:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-700">{t.task}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {t.priority} • {t.status}
                    </p>
                  </div>

                  <div className="text-right text-gray-700">
                    <p className="text-sm">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}