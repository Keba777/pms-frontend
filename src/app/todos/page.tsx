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
import TodoTableSkeleton from "@/components/todos/TodoTableSkeleton";
import TodoCardSkeleton from "@/components/todos/TodoCardSkeleton";

const columnOptions: Record<string, string> = {
  task: "Task",
  type: "Type",
  priority: "Priority",
  assignedBy: "Assigned By",
  assignedUsers: "Assigned Users",
  target_date: "Target Date",
  target: "Target List",
  givenDate: "Given Date",
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

  if (isError) return <div className="text-red-500 text-center py-10">Error loading data.</div>;

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
      header: "Target Date",
      accessor: (row) =>
        row.target_date ? new Date(row.target_date).toISOString().split("T")[0] : "-",
    },
    {
      header: "Target List",
      accessor: (row) => row.target?.join(", ") || "-",
    },
    { header: "Given Date", accessor: (row) => row.givenDate ? new Date(row.givenDate).toISOString().split("T")[0] : "-" },
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
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-black text-primary/90 uppercase tracking-tight">
          Todos
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-cyan-200 hover:text-primary transition-all shadow-sm"
            onClick={() => setIsListView((prev) => !prev)}
          >
            {isListView ? <Grid width={16} height={16} /> : <List width={16} height={16} />}
            <span>{isListView ? "Grid View" : "List View"}</span>
          </button>
          <button
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon width={16} height={16} />
            <span>New Todo</span>
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: total, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Not Started", value: notStartedCount, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "In Progress", value: inProgressCount, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Pending", value: pendingCount, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Completed", value: completedCount, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 shadow-sm ${item.bg}`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
            <span className={`text-2xl font-black ${item.color}`}>
              {isLoading ? 0 : item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div ref={menuRef} className="relative w-full lg:w-auto">
              <button
                onClick={() => setShowColumnMenu((prev) => !prev)}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
              >
                Customize Columns <ChevronDown className="w-4 h-4" />
              </button>
              {showColumnMenu && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2 max-h-[60vh] overflow-y-auto backdrop-blur-sm bg-white/95">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Columns</p>
                  </div>
                  {Object.entries(columnOptions).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(key)}
                        onChange={() => toggleColumn(key)}
                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 mr-3"
                      />
                      <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <GenericDownloads
              data={filteredTodos}
              title="Todos_List"
              columns={columns}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <DatePicker
                selected={fromDate}
                onChange={setFromDate}
                placeholderText="From Due Date"
                className="w-full sm:w-40 rounded-lg border border-gray-200 p-2 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none shadow-sm transition-all"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <DatePicker
                selected={toDate}
                onChange={setToDate}
                placeholderText="To Due Date"
                className="w-full sm:w-40 rounded-lg border border-gray-200 p-2 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none shadow-sm transition-all"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <GenericFilter fields={filterFields} onFilterChange={setFilterValues} />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <TodoForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {isLoading ? (
        isListView ? (
          <TodoTableSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <TodoCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : isListView ? (
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
