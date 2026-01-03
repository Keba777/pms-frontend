"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTaskStore } from "@/store/taskStore";

const Schedule = () => {
  const tasks = useTaskStore((state) => state.tasks);

  const [calendarWeeks, setCalendarWeeks] = useState<
    { day: number | string; date: string; isCurrentMonth: boolean }[][]
  >([]);

  // Store assigned colors for each task ID
  const taskColors = useRef<{ [key: string]: string }>({});

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonthName = months[selectedMonth];

  // Generate a lighter pastel color for each new task ID
  const getTaskColor = (taskId: string) => {
    if (!taskColors.current[taskId]) {
      // Example: lighter pastel color
      taskColors.current[taskId] = `hsl(${Math.random() * 360}, 60%, 80%)`;
    }
    return taskColors.current[taskId];
  };

  // Return tasks matching a given Date
  const getTasksForDay = (date: Date) => {
    if (!date) return [];
    const dateString = date.toISOString().split("T")[0];
    return tasks.filter((task) => {
      // Convert task.start_date to a Date first
      const taskDate = new Date(task.start_date).toISOString().split("T")[0];
      return taskDate === dateString;
    });
  };

  // Build a 2D array (6 weeks, 7 days each) for the selected month
  const generateCalendar = () => {
    const year = currentYear;
    const month = selectedMonth;
    const weeks = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const endDay = lastDayOfMonth.getDate();

    let currentDay = 1;
    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        if (week === 0 && day < startDay) {
          days.push({ day: "", date: "", isCurrentMonth: false });
        } else if (currentDay > endDay) {
          days.push({ day: "", date: "", isCurrentMonth: false });
        } else {
          const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            currentDay
          ).padStart(2, "0")}`;
          days.push({ day: currentDay, date, isCurrentMonth: true });
          currentDay++;
        }
      }
      weeks.push(days);
      if (currentDay > endDay) break;
    }
    setCalendarWeeks(weeks);
  };

  const updateCalendar = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    generateCalendar();
  };

  // Generate the calendar when component mounts or when month/year changes
  useEffect(() => {
    generateCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, currentYear]);

  return (
    <div className="p-4 sm:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">
              Deployment Timeline
            </h1>
            <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-2 flex items-center gap-3">
              <span className="w-12 h-px bg-primary/30" /> Orchestrate mission critical operations
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-2xl shadow-xl shadow-black/5">
            <h2 className="pl-4 pr-2 text-sm font-black text-foreground uppercase tracking-tight">
              {currentMonthName} {currentYear}
            </h2>
            <select
              value={selectedMonth}
              onChange={(e) => updateCalendar(parseInt(e.target.value, 10))}
              className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all outline-none appearance-none cursor-pointer min-w-[140px] text-center"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, idx) => (
                    <th
                      key={idx}
                      className="text-[10px] font-black text-primary uppercase tracking-[0.2em] p-6 bg-primary/5 text-center first:rounded-tl-[2.5rem] last:rounded-tr-[2.5rem]"
                    >
                      {day}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {calendarWeeks.map((week, weekIndex) => (
                <tr key={weekIndex} className="divide-x divide-border">
                  {week.map((day, dayIndex) => (
                    <td
                      key={dayIndex}
                      className={`p-4 transition-colors relative min-h-[140px] group ${day.isCurrentMonth ? "bg-card" : "bg-muted/5 opacity-40 grayscale"
                        }`}
                    >
                      <div className="min-h-[100px] flex flex-col">
                        {/* Day number */}
                        <div className={`text-lg font-black transition-colors ${day.isCurrentMonth ? "text-foreground group-hover:text-primary" : "text-muted-foreground/30"}`}>
                          {day.day}
                        </div>
                        {/* Task badges */}
                        <div className="flex flex-col gap-1.5 mt-2">
                          {day.date &&
                            getTasksForDay(new Date(day.date)).map((task) => (
                              <div
                                key={task.id}
                                className="block text-[8px] font-black uppercase tracking-widest text-primary-foreground px-2 py-1.5 rounded-lg shadow-sm truncate hover:scale-105 transition-transform cursor-pointer border border-black/5"
                                style={{ backgroundColor: getTaskColor(task.id) }}
                                title={task.task_name}
                              >
                                {task.task_name}
                              </div>
                            ))}
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
