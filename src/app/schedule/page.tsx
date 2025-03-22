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
    <div className="p-4">
      <h1 className="text-4xl font-bold text-gray-800">
        Task Management Schedule
      </h1>

      {/* Month Selector */}
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold text-gray-700">
          {currentMonthName} {currentYear}
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => updateCalendar(parseInt(e.target.value, 10))}
          className="p-2 border border-gray-300 rounded"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month} {currentYear}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Table */}
      <div className="mt-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="border border-gray-300">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, idx) => (
                  <th
                    key={idx}
                    className="text-gray-700 p-2 border border-gray-300 bg-teal-100"
                  >
                    {day}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {calendarWeeks.map((week, weekIndex) => (
              <tr key={weekIndex} className="border border-gray-300">
                {week.map((day, dayIndex) => (
                  <td
                    key={dayIndex}
                    className={`p-2 border border-gray-300 ${
                      day.isCurrentMonth ? "bg-rose-100" : "bg-lime-100"
                    }`}
                    style={{ minHeight: "80px" }}
                  >
                    <div className="min-h-[60px]">
                      {/* Day number */}
                      <div className="font-bold text-gray-600">{day.day}</div>
                      {/* Task badges */}
                      {day.date &&
                        getTasksForDay(new Date(day.date)).map((task) => (
                          <div
                            key={task.id}
                            className="inline-block text-xs font-semibold text-white px-2 py-1 rounded mt-1 mr-1"
                            style={{ backgroundColor: getTaskColor(task.id) }}
                          >
                            {task.task_name}
                          </div>
                        ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Schedule;
