// TodosPage.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Grid, List, PlusIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useTodos } from "@/hooks/useTodos";
import { useDepartments } from "@/hooks/useDepartments";
import GenericDownloads, { Column } from "@/components/common/GenericDownloads";
import { Todo } from "@/types/todo";
import {
  FilterField,
  FilterValues,
  GenericFilter,
  Option,
} from "@/components/common/GenericFilter";
import TodoForm from "@/components/forms/TodoForm";
import TodosTable from "@/components/todos/TodosTable";
import TodoCard from "@/components/todos/TodoCard";

const columnOptions: Record<string, string> = {
  task: "Task",
  type: "Type",
  priority: "Priority",
  assignedBy: "Assigned By",
  assignedUsers: "Assigned Users",
  target: "Target",
  dueDate: "Due Date",
  kpi: "KPI",
  department: "Department",
  status: "Status",
  progress: "Progress",
  action: "Action",
};

const TodosPage = () => {
  const { data: todos, isLoading: todoLoading, error: todoError } = useTodos();
  const {
    data: departments,
    isLoading: deptLoading,
    error: deptError,
  } = useDepartments();

  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    Object.keys(columnOptions)
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    return todos.filter((t: Todo) => {
      let matches = true;

      if (filterValues.task) {
        matches =
          matches &&
          t.task
            .toLowerCase()
            .includes((filterValues.task as string).toLowerCase());
      }
      if (filterValues.priority) {
        matches = matches && t.priority === filterValues.priority;
      }
      if (filterValues.status) {
        matches = matches && t.status === filterValues.status;
      }

      if (fromDate) {
        matches = matches && new Date(t.dueDate) >= fromDate;
      }
      if (toDate) {
        matches = matches && new Date(t.dueDate) <= toDate;
      }

      return matches;
    });
  }, [filterValues, todos, fromDate, toDate]);

  const isLoading = todoLoading || deptLoading;
  const isError = todoError || deptError;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading data.</div>;

  const total = todos?.length ?? 0;
  const notStartedCount =
    todos?.filter((t) => t.status === "Not Started").length ?? 0;
  const inProgressCount =
    todos?.filter((t) => t.status === "In progress").length ?? 0;
  const pendingCount = todos?.filter((t) => t.status === "Pending").length ?? 0;
  const completedCount =
    todos?.filter((t) => t.status === "Completed").length ?? 0;

  const columns: Column<Todo>[] = [
    { header: "Task", accessor: "task" },
    { header: "Type", accessor: "type" },
    { header: "Priority", accessor: (row) => row.priority || "-" },
    {
      header: "Assigned By",
      accessor: (row) => row.assignedBy?.first_name || "-",
    },
    {
      header: "Assigned Users",
      accessor: (row) =>
        row.assignedUsers?.map((u) => u.first_name).join(", ") || "-",
    },
    {
      header: "Target",
      accessor: (row) =>
        row.target ? new Date(row.target).toISOString().split("T")[0] : "-",
    },
    {
      header: "Due Date",
      accessor: (row) =>
        row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "-",
    },
    { header: "KPI", accessor: (row) => row.kpi?.score || row.kpiId || "-" },
    {
      header: "Department",
      accessor: (row) =>
        row.department?.name ||
        departments?.find((d) => d.id === row.departmentId)?.name ||
        "-",
    },
    { header: "Status", accessor: "status" },
    { header: "Progress", accessor: "progress" },
  ];

  const priorityOptions: Option<string>[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Urgent", value: "Urgent" },
  ];
  const statusOptions: Option<string>[] = [
    { label: "Not Started", value: "Not Started" },
    { label: "In progress", value: "In progress" },
    { label: "Pending", value: "Pending" },
    { label: "Completed", value: "Completed" },
  ];

  const filterFields: FilterField<string>[] = [
    {
      name: "task",
      label: "Task",
      type: "text",
      placeholder: "Search by task…",
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      options: priorityOptions,
    },
    { name: "status", label: "Status", type: "select", options: statusOptions },
  ];

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 lg:p-6 bg-white shadow-lg rounded-lg mt-6">
      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Total", value: total },
          { label: "Not Started", value: notStartedCount },
          { label: "In Progress", value: inProgressCount },
          { label: "Pending", value: pendingCount },
          { label: "Completed", value: completedCount },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center font-semibold bg-white p-4 rounded-lg shadow-md text-center"
          >
            <h2 className="text-sm sm:text-base">{item.label}</h2>
            <span className="text-cyan-700 text-lg sm:text-xl font-bold">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setIsListView((prev) => !prev)}
          >
            {isListView ? (
              <Grid width={15} height={12} />
            ) : (
              <List width={15} height={12} />
            )}
          </button>
          <button
            className="flex-1 sm:flex-none bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-2 px-3 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={15} height={12} />
          </button>
        </div>
        <div className="w-full sm:w-auto">
          <GenericDownloads
            data={filteredTodos}
            title="Todos_List"
            columns={columns}
          />
        </div>
      </div>

      {/* Filters + Date Pickers */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6 items-start">
        {/* Customize Columns Button */}
        <div ref={menuRef} className="relative w-full lg:w-auto shrink-0">
          <button
            onClick={() => setShowColumnMenu((prev) => !prev)}
            className="flex items-center justify-center gap-1 px-4 py-2 text-sm bg-cyan-700 text-white rounded hover:bg-cyan-800 w-full lg:w-auto whitespace-nowrap"
          >
            Customize Columns <ChevronDown className="w-4 h-4" />
          </button>
          {showColumnMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white border rounded shadow-lg z-10">
              {Object.entries(columnOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(key)}
                    onChange={() => toggleColumn(key)}
                    className="mr-2"
                  />
                  {label || <span>&nbsp;</span>}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filters + Date Pickers */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto">
          <div className="flex-1 min-w-[200px]">
            <GenericFilter
              fields={filterFields}
              onFilterChange={setFilterValues}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <DatePicker
              selected={fromDate}
              onChange={setFromDate}
              placeholderText="From Date"
              className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
              dateFormat="yyyy-MM-dd"
            />
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              placeholderText="To Date"
              className="rounded border border-gray-300 p-2 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TodoForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-800 mb-4">
        Todos
      </h1>

      {isListView ? (
        <TodosTable
          filteredTodos={filteredTodos}
          selectedColumns={selectedColumns}
          departments={departments || []}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              departments={departments || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodosPage;
